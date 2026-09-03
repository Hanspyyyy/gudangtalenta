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

export type MutationResult = { ok: true } | { ok: false; error: string }

const ITEMS_KEY = 'talenta-local-items'
const ACTIVITY_KEY = 'talenta-local-activity'

export const localInventoryEvent = 'talenta-inventory-updated'

function normalizeWarehouse(warehouse: string) {
  return warehouse === 'Gudang 2' ? 'Gudang 2' : 'Gudang 1'
}

export function readLocalItems(): LocalItem[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(ITEMS_KEY) ?? '[]')
  } catch {
    return []
  }
}

export function readLocalActivity(): ActivityLog[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(ACTIVITY_KEY) ?? '[]')
  } catch {
    return []
  }
}

function persist(items: LocalItem[], logs: ActivityLog[]): MutationResult {
  try {
    localStorage.setItem(ITEMS_KEY, JSON.stringify(items))
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(logs))
    window.dispatchEvent(new CustomEvent(localInventoryEvent))
    return { ok: true }
  } catch (error) {
    const isQuota = error instanceof DOMException && (error.name === 'QuotaExceededError' || error.code === 22)
    return {
      ok: false,
      error: isQuota
        ? 'Penyimpanan penuh. Gunakan foto berukuran lebih kecil atau hapus barang lama.'
        : 'Gagal menyimpan data barang.',
    }
  }
}

export function saveLocalItem(item: LocalItem): MutationResult {
  const normalizedItem: LocalItem = {
    ...item,
    warehouse: normalizeWarehouse(item.warehouse),
    rack: item.rack.trim() || '-',
  }
  const items = [normalizedItem, ...readLocalItems()]
  const logs: ActivityLog[] = [
    {
      id: crypto.randomUUID(),
      type: 'in',
      message: `Menambahkan barang: ${normalizedItem.name} - ${normalizedItem.stock} unit`,
      createdAt: normalizedItem.createdAt,
    },
    ...readLocalActivity(),
  ]
  return persist(items, logs)
}

export function adjustLocalItemStock(id: string, type: 'in' | 'out', quantity: number): MutationResult {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return { ok: false, error: 'Jumlah harus berupa angka bulat lebih dari 0.' }
  }
  const items = readLocalItems()
  const target = items.find((item) => item.id === id)
  if (!target) return { ok: false, error: 'Barang tidak ditemukan.' }
  if (type === 'out' && quantity > target.stock) {
    return { ok: false, error: 'Jumlah keluar melebihi stok yang tersedia.' }
  }
  const nextStock = type === 'in' ? target.stock + quantity : target.stock - quantity
  const nextItems = items.map((item) => (item.id === id ? { ...item, stock: nextStock } : item))
  const logs: ActivityLog[] = [
    {
      id: crypto.randomUUID(),
      type,
      message:
        type === 'in'
          ? `Barang masuk: ${target.name} +${quantity} unit (stok ${nextStock})`
          : `Barang keluar: ${target.name} -${quantity} unit (stok ${nextStock})`,
      createdAt: new Date().toISOString(),
    },
    ...readLocalActivity(),
  ]
  return persist(nextItems, logs)
}

export function deleteLocalItem(id: string): MutationResult {
  const items = readLocalItems()
  const target = items.find((item) => item.id === id)
  const nextItems = items.filter((item) => item.id !== id)
  const logs: ActivityLog[] = target
    ? [
        {
          id: crypto.randomUUID(),
          type: 'delete',
          message: `Menghapus barang: ${target.name}`,
          createdAt: new Date().toISOString(),
        },
        ...readLocalActivity(),
      ]
    : readLocalActivity()
  return persist(nextItems, logs)
}
