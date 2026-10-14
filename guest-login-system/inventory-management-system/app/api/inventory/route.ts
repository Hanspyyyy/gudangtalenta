import { type NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import inventoryData from '@/data/inventory.json'
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
    // Membaca data langsung dari data/inventory.json lokal
    const items = Array.isArray(inventoryData) ? inventoryData : (inventoryData as any)?.items || []
    return NextResponse.json({ items })
  } catch (err: any) {
    console.error('Inventory GET Error:', err)
    return NextResponse.json({ items: [], error: err.message }, { status: 500 })
  }
}
