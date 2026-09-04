import 'server-only'
import { list, put, del } from '@vercel/blob'
import type { InventoryData, LocalItem } from '@/lib/inventory-types'

const DATA_PATH = 'inventory/data.json'
const EMPTY: InventoryData = { items: [], activity: [] }

// In-flight write serialization within a single server instance to reduce
// read-modify-write races on the shared JSON document.
let writeChain: Promise<unknown> = Promise.resolve()

async function locateDataUrl(): Promise<string | null> {
  const { blobs } = await list({ prefix: DATA_PATH, limit: 1 })
  const match = blobs.find((b) => b.pathname === DATA_PATH)
  return match?.url ?? null
}

export async function readInventory(): Promise<InventoryData> {
  const url = await locateDataUrl()
  if (!url) return { items: [], activity: [] }
  try {
    // Cache-bust so every device reads the freshest document.
    const res = await fetch(`${url}?t=${Date.now()}`, { cache: 'no-store' })
    if (!res.ok) return { items: [], activity: [] }
    const parsed = (await res.json()) as Partial<InventoryData>
    return {
      items: Array.isArray(parsed.items) ? parsed.items : [],
      activity: Array.isArray(parsed.activity) ? parsed.activity : [],
    }
  } catch {
    return { items: [], activity: [] }
  }
}

async function writeInventory(data: InventoryData): Promise<void> {
  await put(DATA_PATH, JSON.stringify(data), {
    access: 'public',
    contentType: 'application/json',
    allowOverwrite: true,
    addRandomSuffix: false,
    cacheControlMaxAge: 0,
  })
}

// Serialize a read-modify-write against the shared document.
export async function mutateInventory<T>(
  mutator: (data: InventoryData) => { data: InventoryData; result: T },
): Promise<T> {
  const run = writeChain.then(async () => {
    const current = await readInventory()
    const { data, result } = mutator(current)
    await writeInventory(data)
    return result
  })
  // Keep the chain alive regardless of individual success/failure.
  writeChain = run.then(
    () => undefined,
    () => undefined,
  )
  return run
}

// Upload a base64 data URL photo to Blob and return its public URL.
export async function uploadPhoto(dataUrl: string, id: string): Promise<string | null> {
  if (!dataUrl.startsWith('data:')) return dataUrl || null
  try {
    const [meta, base64] = dataUrl.split(',')
    const contentType = meta.match(/data:(.*?);/)?.[1] ?? 'image/jpeg'
    const ext = contentType.split('/')[1]?.split('+')[0] ?? 'jpg'
    const buffer = Buffer.from(base64, 'base64')
    const blob = await put(`inventory/photos/${id}.${ext}`, buffer, {
      access: 'public',
      contentType,
      allowOverwrite: true,
      addRandomSuffix: false,
    })
    return blob.url
  } catch {
    return null
  }
}

export async function deletePhoto(item: LocalItem | undefined): Promise<void> {
  if (!item?.photo || !item.photo.startsWith('http')) return
  try {
    await del(item.photo)
  } catch {
    // best-effort cleanup
  }
}

export { EMPTY }
