export type LocalItem = {
  id: string
  name: string
  size: string
  category: string
  warehouse: string
  rack: string
  stock: number
  photo: string | null
  createdAt: string
}

export type ActivityLog = {
  id: string
  type: 'in' | 'out' | 'delete'
  message: string
  createdAt: string
}

export type InventoryData = {
  items: LocalItem[]
  activity: ActivityLog[]
}

export type MutationResult = { ok: true } | { ok: false; error: string }

export function normalizeWarehouse(warehouse: string) {
  return warehouse === 'Gudang 2' ? 'Gudang 2' : 'Gudang 1'
}
