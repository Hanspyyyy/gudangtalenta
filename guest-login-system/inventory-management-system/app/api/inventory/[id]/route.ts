import { randomUUID } from 'crypto'
import { NextResponse } from 'next/server'
import { deletePhoto, mutateInventory, readInventory } from '@/lib/inventory-store'
import type { ActivityLog } from '@/lib/inventory-types'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type Context = { params: Promise<{ id: string }> }

export async function DELETE(_request: Request, { params }: Context) {
  try {
    const { id } = await params
    if (!id?.trim()) return NextResponse.json({ error: 'ID tidak ditemukan' }, { status: 400 })

    const current = await readInventory()
    const item = current.items.find((candidate) => String(candidate.id) === id)
    if (!item) return NextResponse.json({ error: 'Barang tidak ditemukan' }, { status: 404 })

    await deletePhoto(item)
    await mutateInventory((data) => {
      const log: ActivityLog = {
        id: randomUUID(), item_id: item.id, item_name: item.name,
        action: 'DELETE_ITEM', quantity: item.stock, warehouse: item.warehouse,
        timestamp: new Date().toISOString(),
      }
      return {
        data: { items: data.items.filter((candidate) => String(candidate.id) !== id), activity: [log, ...data.activity] },
        result: true,
      }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/inventory/[id] Error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Gagal menghapus barang' }, { status: 500 })
  }
}

export async function GET(_request: Request, { params }: Context) {
  const { id } = await params
  const item = (await readInventory()).items.find((candidate) => String(candidate.id) === id)
  return item ? NextResponse.json({ item }) : NextResponse.json({ error: 'Barang tidak ditemukan' }, { status: 404 })
}
