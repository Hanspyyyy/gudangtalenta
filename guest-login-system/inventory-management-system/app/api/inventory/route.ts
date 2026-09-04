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

export async function GET() {
  const data = await readInventory()
  return NextResponse.json(data, {
    headers: { 'Cache-Control': 'no-store' },
  })
}

// Add a new item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const name = String(body.name ?? '').trim()
    const size = String(body.size ?? '').trim()
    const category = String(body.category ?? '').trim()
    const warehouse = normalizeWarehouse(String(body.warehouse ?? ''))
    const rack = String(body.rack ?? '').trim() || '-'
    const stock = Number(body.stock)

    if (!name || !size || !category || !Number.isInteger(stock) || stock < 0) {
      return NextResponse.json({ error: 'Data barang tidak valid.' }, { status: 400 })
    }

    const id = randomUUID()
    const photoUrl = body.photo ? await uploadPhoto(String(body.photo), id) : null
    const createdAt = new Date().toISOString()

    const item: LocalItem = { id, name, size, category, warehouse, rack, stock, photo: photoUrl, createdAt }

    await mutateInventory((data) => {
      const log: ActivityLog = {
        id: randomUUID(),
        type: 'in',
        message: `Menambahkan barang: ${name} - ${stock} unit`,
        createdAt,
      }
      return {
        data: { items: [item, ...data.items], activity: [log, ...data.activity] },
        result: null,
      }
    })

    return NextResponse.json({ ok: true, item })
  } catch (error) {
    console.error('[v0] POST /api/inventory failed:', error)
    return NextResponse.json({ error: 'Gagal menyimpan barang ke server.' }, { status: 500 })
  }
}

// Adjust stock (in/out)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const id = String(body.id ?? '')
    const type = body.type === 'out' ? 'out' : 'in'
    const quantity = Number(body.quantity)

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return NextResponse.json({ error: 'Jumlah harus berupa angka bulat lebih dari 0.' }, { status: 400 })
    }

    const outcome = await mutateInventory((data) => {
      const target = data.items.find((i) => i.id === id)
      if (!target) {
        return { data, result: { error: 'Barang tidak ditemukan.' } }
      }
      if (type === 'out' && quantity > target.stock) {
        return { data, result: { error: 'Jumlah keluar melebihi stok yang tersedia.' } }
      }
      const nextStock = type === 'in' ? target.stock + quantity : target.stock - quantity
      const log: ActivityLog = {
        id: randomUUID(),
        type,
        message:
          type === 'in'
            ? `Barang masuk: ${target.name} +${quantity} unit (stok ${nextStock})`
            : `Barang keluar: ${target.name} -${quantity} unit (stok ${nextStock})`,
        createdAt: new Date().toISOString(),
      }
      return {
        data: {
          items: data.items.map((i) => (i.id === id ? { ...i, stock: nextStock } : i)),
          activity: [log, ...data.activity],
        },
        result: { error: null as string | null },
      }
    })

    if (outcome.error) {
      return NextResponse.json({ error: outcome.error }, { status: 400 })
    }
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[v0] PATCH /api/inventory failed:', error)
    return NextResponse.json({ error: 'Gagal memperbarui stok di server.' }, { status: 500 })
  }
}

// Delete an item
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const id = String(body.id ?? '')

    let removed: LocalItem | undefined
    await mutateInventory((data) => {
      removed = data.items.find((i) => i.id === id)
      const log: ActivityLog | null = removed
        ? {
            id: randomUUID(),
            type: 'delete',
            message: `Menghapus barang: ${removed.name}`,
            createdAt: new Date().toISOString(),
          }
        : null
      return {
        data: {
          items: data.items.filter((i) => i.id !== id),
          activity: log ? [log, ...data.activity] : data.activity,
        },
        result: null,
      }
    })

    await deletePhoto(removed)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[v0] DELETE /api/inventory failed:', error)
    return NextResponse.json({ error: 'Gagal menghapus barang di server.' }, { status: 500 })
  }
}
