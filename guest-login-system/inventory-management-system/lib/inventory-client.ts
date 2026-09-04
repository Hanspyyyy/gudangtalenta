'use client'
import useSWR, { mutate as globalMutate } from 'swr'
import type { ActivityLog, InventoryData, LocalItem, MutationResult } from '@/lib/inventory-types'

const KEY = '/api/inventory'

const fetcher = async (url: string): Promise<InventoryData> => {
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error('Gagal memuat data inventaris.')
  return res.json()
}

export function useInventory() {
  const { data, error, isLoading } = useSWR<InventoryData>(KEY, fetcher, {
    refreshInterval: 5000,
    revalidateOnFocus: true,
    keepPreviousData: true,
  })
  return {
    items: data?.items ?? [],
    activity: data?.activity ?? [],
    isLoading,
    error,
  }
}

export function refreshInventory() {
  return globalMutate(KEY)
}

async function parseError(res: Response): Promise<string> {
  try {
    const body = await res.json()
    return body?.error ?? 'Terjadi kesalahan pada server.'
  } catch {
    return 'Terjadi kesalahan pada server.'
  }
}

export async function addItem(payload: {
  name: string
  size: string
  category: string
  warehouse: string
  rack: string
  stock: number
  photo: string | null
}): Promise<MutationResult> {
  try {
    const res = await fetch(KEY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) return { ok: false, error: await parseError(res) }
    await refreshInventory()
    return { ok: true }
  } catch {
    return { ok: false, error: 'Gagal terhubung ke server.' }
  }
}

export async function adjustItemStock(id: string, type: 'in' | 'out', quantity: number): Promise<MutationResult> {
  try {
    const res = await fetch(KEY, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, type, quantity }),
    })
    if (!res.ok) return { ok: false, error: await parseError(res) }
    await refreshInventory()
    return { ok: true }
  } catch {
    return { ok: false, error: 'Gagal terhubung ke server.' }
  }
}

export async function deleteItem(id: string): Promise<MutationResult> {
  try {
    const res = await fetch(KEY, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (!res.ok) return { ok: false, error: await parseError(res) }
    await refreshInventory()
    return { ok: true }
  } catch {
    return { ok: false, error: 'Gagal terhubung ke server.' }
  }
}

export type { ActivityLog, LocalItem }
