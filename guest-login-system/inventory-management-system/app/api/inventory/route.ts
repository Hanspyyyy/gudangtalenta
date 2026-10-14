import { type NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import {
  readInventory,
  mutateInventory,
  uploadPhoto,
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
      const uploaded = await uploadPhoto(photo, id)
      photoUrl = uploaded || ''
    } else if (typeof photo === 'string') {
      photoUrl = photo
    }

    const newItem: LocalItem = {
      id,
      name,
      size: size || '-',
      category: category || '-',
      warehouse: normalizeWarehouse(warehouse || 'Gudang 1'),
      rack: rack || '-',
      stock: typeof stock === 'number' ? stock : parseInt(stock || '0', 10),
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
    const { id, action, stock, targetWarehouse, ...updates } = body

    let updatedItem: LocalItem | null = null

    await mutateInventory((data) => {
      const items = [...(data.items || [])]
      const activities = [...(data.activity || [])]
      const idx = items.findIndex((i) => i.id === id)

      if (idx === -1) return { data, result: null }

      const item = { ...items[idx] }

      if (action === 'update_stock') {
        const diff = (stock || 0) - item.stock
        item.stock = typeof stock === 'number' ? stock : item.stock
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

    return NextResponse.json({ item: updatedItem })
  } catch (err: any) {
    console.error('PUT Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID tidak ditemukan' }, { status: 400 })
    }

    await mutateInventory((data) => {
      const itemToDelete = data.items.find((i) => i.id === id)
      const filteredItems = data.items.filter((i) => i.id !== id)

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
