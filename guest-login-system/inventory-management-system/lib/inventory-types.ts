export type LocalItem = {
  id: string
  name: string
  size: string
  category: string
  warehouse: string
  rack: string
  stock: number
  photo_url?: string
  photo?: string | null
  created_at?: string
  updated_at?: string
  createdAt?: string
}

export type ActivityLog = {
  id: string
  item_id?: string
  item_name?: string
  action?: 'ADD_ITEM' | 'STOCK_IN' | 'STOCK_OUT' | 'TRANSFER' | 'DELETE_ITEM'
  quantity?: number
  warehouse?: string
  timestamp?: string
  type?: 'in' | 'out' | 'delete'
  message?: string
  createdAt?: string
}

export type InventoryData = {
  items: LocalItem[]
  activity: ActivityLog[]
}

export type MutationResult = { ok: true } | { ok: false; error: string }

export function normalizeWarehouse(warehouse: string) {
  return warehouse === 'Gudang 2' ? 'Gudang 2' : 'Gudang 1'
}
