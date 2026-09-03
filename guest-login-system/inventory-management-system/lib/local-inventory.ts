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
  type: 'in'
  message: string
  createdAt: string
}

const ITEMS_KEY = 'talenta-local-items'
const ACTIVITY_KEY = 'talenta-local-activity'

export function readLocalItems(): LocalItem[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(ITEMS_KEY) ?? '[]') } catch { return [] }
}
export function readLocalActivity(): ActivityLog[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(ACTIVITY_KEY) ?? '[]') } catch { return [] }
}
export function saveLocalItem(item: LocalItem) {
  const normalizedItem = { ...item, warehouse: item.warehouse === 'Gudang 2' ? 'Gudang 2' : 'Gudang 1', rack: item.rack.trim() || '-' }
  const items = [normalizedItem, ...readLocalItems()]
  localStorage.setItem(ITEMS_KEY, JSON.stringify(items))
  const logs = [{ id: crypto.randomUUID(), type: 'in' as const, message: `Menambahkan barang: ${item.name} - ${item.stock} unit`, createdAt: item.createdAt }, ...readLocalActivity()]
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(logs))
  window.dispatchEvent(new CustomEvent('talenta-inventory-updated'))
}
export function deleteLocalItem(id: string) {
  localStorage.setItem(ITEMS_KEY, JSON.stringify(readLocalItems().filter((item) => item.id !== id)))
  window.dispatchEvent(new CustomEvent(localInventoryEvent))
}

export const localInventoryEvent = 'talenta-inventory-updated'
