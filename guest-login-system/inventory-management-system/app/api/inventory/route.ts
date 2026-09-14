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
    const supabase = await createClient()

    const { data: inventory, error } = await supabase
      .from('inventory')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase Error:', error)
      return NextResponse.json({ items: [], error: error.message }, { status: 500 })
    }

    return NextResponse.json({ items: inventory || [] })
  } catch (err: any) {
    return NextResponse.json({ items: [], error: err.message }, { status: 500 })
  }
}
