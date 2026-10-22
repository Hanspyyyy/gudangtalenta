import { type NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import {
  readInventory,
  mutateInventory,
  uploadPhoto,
  deletePhoto,
} from '@/lib/inventory-store'
import { normalizeWarehouse, type ActivityLog, type LocalItem } from '@/lib/inventory-types'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    const data = await readInventory()
    return NextResponse.json({ items: data.items || [] })
  } catch (err: any) {
    console.error('Inventory GET Error:', err)
    return NextResponse.json({ items: [], error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, size, category, warehouse, rack, stock, photo } = body

    if (!name) {
      return NextResponse.json({ error: 'Nama barang wajib diisi' }, { status: 400 })
    }

    const id = randomUUID()
    let photoUrl = ''

    if (photo && typeof photo === 'string' && photo.startsWith('data:')) {
      photoUrl = await uploadPhoto(photo, id)
    } else if (typeof photo === 'string') {
      photoUrl = photo
    }

    const parsedStock = typeof stock === 'number' ? stock : Number(stock ?? 0)
    if (!Number.isInteger(parsedStock) || parsedStock < 0) {
      return NextResponse.json({ error: 'Stok harus berupa angka bulat positif' }, { status: 400 })
    }

    const newItem: LocalItem = {
      id,
      name: String(name).trim(),
      size: size || '-',
      category: category || '-',
      warehouse: normalizeWarehouse(warehouse || 'Gudang 1'),
      rack: rack || '-',
      stock: parsedStock,
      photo_url: photoUrl,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const log: ActivityLog = {
      id: randomUUID(),
      item_id: newItem.id,
      item_name: newItem.name,
      action: 'ADD_ITEM',
      quantity: newItem.stock,
      warehouse: newItem.warehouse,
      timestamp: new Date().toISOString(),
    }

    await mutateInventory((data) => {
      return {
        data: {
          items: [newItem, ...(data.items || [])],
          activity: [log, ...(data.activity || [])],
        },
        result: newItem,
      }
    })

    return NextResponse.json({ item: newItem })
  } catch (err: any) {
    console.error('POST Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, action, stock, targetWarehouse, photo, ...updates } = body

    if (!id) return NextResponse.json({ error: 'ID tidak ditemukan' }, { status: 400 })
    if (photo && typeof photo === 'string' && photo.startsWith('data:')) {
      updates.photo_url = await uploadPhoto(photo, id)
    } else if (typeof photo === 'string') {
      updates.photo_url = photo
    }

    let updatedItem: LocalItem | null = null

    await mutateInventory((data) => {
      const items = [...(data.items || [])]
      const activities = [...(data.activity || [])]
      const idx = items.findIndex((i) => i.id === id)

      if (idx === -1) return { data, result: null }

      const item = { ...items[idx] }

      if (action === 'update_stock') {
        const nextStock = typeof stock === 'number' ? stock : Number(stock)
        if (!Number.isInteger(nextStock) || nextStock < 0) throw new Error('Stok harus berupa angka bulat positif')
        const diff = nextStock - item.stock
        item.stock = nextStock
        activities.unshift({
          id: randomUUID(),
          item_id: item.id,
          item_name: item.name,
          action: diff >= 0 ? 'STOCK_IN' : 'STOCK_OUT',
          quantity: Math.abs(diff),
          warehouse: item.warehouse,
          timestamp: new Date().toISOString(),
        })
      } else if (action === 'transfer') {
        const oldWarehouse = item.warehouse
        item.warehouse = normalizeWarehouse(targetWarehouse || item.warehouse)
        activities.unshift({
          id: randomUUID(),
          item_id: item.id,
          item_name: item.name,
          action: 'TRANSFER',
          quantity: item.stock,
          warehouse: `${oldWarehouse} -> ${item.warehouse}`,
          timestamp: new Date().toISOString(),
        })
      } else {
        Object.assign(item, updates)
      }

      item.updated_at = new Date().toISOString()
      items[idx] = item
      updatedItem = item

      return {
        data: { items, activity: activities },
        result: updatedItem,
      }
    })

    if (!updatedItem) return NextResponse.json({ error: 'Barang tidak ditemukan' }, { status: 404 })
    return NextResponse.json({ item: updatedItem })
  } catch (err: any) {
    console.error('PUT Error:', err)
    const message = err instanceof Error ? err.message : 'Gagal memperbarui barang'
    return NextResponse.json({ error: message }, { status: message === 'Stok tidak mencukupi' ? 400 : 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, type, quantity, name, rack, category, size, warehouse } = await req.json()

    const editableField = [
      ['rack', rack, 'Rak'],
      ['category', category, 'Kategori'],
      ['size', size, 'Ukuran'],
      ['warehouse', warehouse, 'Gudang'],
    ].find(([, value]) => typeof value === 'string')

    if (id && editableField) {
      const [field, value, label] = editableField as ['rack' | 'category' | 'size' | 'warehouse', string, string]
      const nextValue = value.trim()
      if (!nextValue) return NextResponse.json({ error: `${label} wajib diisi` }, { status: 400 })

      let updatedItem: LocalItem | null = null
      await mutateInventory((data) => {
        const items = [...data.items]
        const itemIndex = items.findIndex((item) => String(item.id) === String(id))
        if (itemIndex < 0) return { data, result: null }
        const item = { ...items[itemIndex], [field]: nextValue, updated_at: new Date().toISOString() }
        items[itemIndex] = item
        updatedItem = item
        return { data: { items, activity: data.activity }, result: item }
      })
      if (!updatedItem) return NextResponse.json({ error: 'Barang tidak ditemukan' }, { status: 404 })
      return NextResponse.json({ item: updatedItem })
    }

    if (id && typeof name === 'string') {
      const nextName = name.trim()
      if (!nextName) return NextResponse.json({ error: 'Nama barang wajib diisi' }, { status: 400 })

      let updatedItem: LocalItem | null = null
      await mutateInventory((data) => {
        const items = [...data.items]
        const itemIndex = items.findIndex((item) => String(item.id) === String(id))
        if (itemIndex < 0) return { data, result: null }
        const item = { ...items[itemIndex], name: nextName, updated_at: new Date().toISOString() }
        items[itemIndex] = item
        updatedItem = item
        return { data: { items, activity: data.activity }, result: item }
      })
      if (!updatedItem) return NextResponse.json({ error: 'Barang tidak ditemukan' }, { status: 404 })
      return NextResponse.json({ item: updatedItem })
    }

    const amount = Number(quantity)
    if (!id || !['in', 'out'].includes(type) || !Number.isInteger(amount) || amount <= 0) {
      return NextResponse.json({ error: 'ID, tipe, dan jumlah stok tidak valid' }, { status: 400 })
    }
    let updatedItem: LocalItem | null = null
    await mutateInventory((data) => {
      const items = [...data.items]
      const itemIndex = items.findIndex((item) => item.id === String(id))
      if (itemIndex < 0) return { data, result: null }
      const item = { ...items[itemIndex] }
      if (type === 'out' && amount > item.stock) throw new Error('Stok tidak mencukupi')
      item.stock += type === 'in' ? amount : -amount
      item.updated_at = new Date().toISOString()
      items[itemIndex] = item
      updatedItem = item
      return {
        data: {
          items,
          activity: [{ id: randomUUID(), item_id: item.id, item_name: item.name, action: type === 'in' ? 'STOCK_IN' : 'STOCK_OUT', quantity: amount, warehouse: item.warehouse, timestamp: new Date().toISOString() }, ...data.activity],
        },
        result: item,
      }
    })
    if (!updatedItem) return NextResponse.json({ error: 'Barang tidak ditemukan' }, { status: 404 })
    return NextResponse.json({ item: updatedItem })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal memperbarui stok'
    console.error('PATCH Error:', err)
    return NextResponse.json({ error: message }, { status: message === 'Stok tidak mencukupi' ? 400 : 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const body = await req.json().catch(() => ({}))
    const id = searchParams.get('id') || (typeof body.id === 'string' ? body.id : '')
    const name = searchParams.get('name') || (typeof body.name === 'string' ? body.name.trim() : '')

    if (!id && !name) {
      return NextResponse.json({ error: 'ID atau nama barang wajib diisi' }, { status: 400 })
    }

    const current = await readInventory()
    const itemToDelete = current.items.find((item) => (id && item.id === id) || (!item.id && name && item.name === name))
    if (!itemToDelete) return NextResponse.json({ error: 'Barang tidak ditemukan' }, { status: 404 })
    await deletePhoto(itemToDelete)

    await mutateInventory((data) => {
      const filteredItems = data.items.filter((item) => item !== itemToDelete && !(id && item.id === id) && !(!item.id && name && item.name === name))

      const log: ActivityLog | null = itemToDelete
        ? {
            id: randomUUID(),
            item_id: itemToDelete.id,
            item_name: itemToDelete.name,
            action: 'DELETE_ITEM',
            quantity: itemToDelete.stock,
            warehouse: itemToDelete.warehouse,
            timestamp: new Date().toISOString(),
          }
        : null

      return {
        data: {
          items: filteredItems,
          activity: log ? [log, ...(data.activity || [])] : data.activity || [],
        },
        result: true,
      }
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('DELETE Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
