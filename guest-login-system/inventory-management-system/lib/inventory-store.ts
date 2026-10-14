import 'server-only'
import type { InventoryData, LocalItem } from '@/lib/inventory-types'

const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const REPO_OWNER = 'Hanspyyy'
const REPO_NAME = 'gudangtalenta'
const FILE_PATH = 'guest-login-system/inventory-management-system/data/inventory.json'
const BRANCH = 'main'

const EMPTY: InventoryData = { items: [], activity: [] }
let writeChain: Promise<unknown> = Promise.resolve()

// Fungsi pembantu ambil file dari GitHub API
async function getGitHubFile() {
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}?ref=${BRANCH}`
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
    },
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error(`Gagal mengambil data dari GitHub (${res.status})`)
  }

  return await res.json()
}

// Membaca inventory dari data/inventory.json di GitHub
export async function readInventory(): Promise<InventoryData> {
  try {
    const fileData = await getGitHubFile()
    const content = Buffer.from(fileData.content, 'base64').toString('utf-8')
    const parsed = JSON.parse(content)

    // Jika berbentuk array langsung
    if (Array.isArray(parsed)) {
      return { items: parsed, activity: [] }
    }

    return {
      items: Array.isArray(parsed.items) ? parsed.items : [],
      activity: Array.isArray(parsed.activity) ? parsed.activity : [],
    }
  } catch (err) {
    console.error('Error readInventory:', err)
    return { ...EMPTY }
  }
}

// Menulis update data (tambah/edit/hapus stok) secara serialized ke GitHub
async function writeInventory(data: InventoryData, sha: string): Promise<void> {
  const updatedContent = Buffer.from(JSON.stringify(data, null, 2)).toString('base64')
  const updateUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`

  const res = await fetch(updateUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: 'Update inventory via Mobile Web App',
      content: updatedContent,
      sha: sha,
      branch: BRANCH,
    }),
  })

  if (!res.ok) {
    const errRes = await res.json()
    throw new Error(errRes.message || 'Gagal menyimpan data ke GitHub')
  }
}

// Menjaga antrean update data agar tidak terjadi race condition
export async function mutateInventory<T>(
  mutator: (data: InventoryData) => { data: InventoryData; result: T }
): Promise<T> {
  const run = writeChain.then(async () => {
    const fileData = await getGitHubFile()
    const content = Buffer.from(fileData.content, 'base64').toString('utf-8')
    const parsed = JSON.parse(content)

    const current: InventoryData = Array.isArray(parsed)
      ? { items: parsed, activity: [] }
      : {
          items: Array.isArray(parsed.items) ? parsed.items : [],
          activity: Array.isArray(parsed.activity) ? parsed.activity : [],
        }

    const { data, result } = mutator(current)
    await writeInventory(data, fileData.sha)
    return result
  })

  writeChain = run.then(
    () => undefined,
    () => undefined
  )

  return run
}

// Upload foto barang langsung ke public/inventory-photos/ di GitHub
export async function uploadPhoto(dataUrl: string, id: string): Promise<string | null> {
  if (!dataUrl) return null
  if (!dataUrl.startsWith('data:')) return dataUrl

  try {
    const [meta, base64] = dataUrl.split(',')
    const contentType = meta.match(/data:(.*?);/)?.[1] ?? 'image/jpeg'
    const ext = contentType.split('/')[1]?.split('+')[0] ?? 'jpg'
    const fileName = `${id}-${Date.now()}.${ext}`
    const photoPath = `guest-login-system/inventory-management-system/public/inventory-photos/${fileName}`

    const uploadUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${photoPath}`
    const res = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Upload photo ${fileName}`,
        content: base64,
        branch: BRANCH,
      }),
    })

    if (!res.ok) {
      console.error('Failed to upload photo to GitHub:', await res.json())
      return null
    }

    return `/inventory-photos/${fileName}`
  } catch (err) {
    console.error('Error uploadPhoto:', err)
    return null
  }
}

// Hapus foto dari repo (opsional / best-effort)
export async function deletePhoto(item: LocalItem | undefined): Promise<void> {
  const photoPath = item?.photo_url || (item as any)?.photo
  if (!photoPath || !photoPath.includes('/inventory-photos/')) return

  try {
    const fileName = photoPath.split('/inventory-photos/')[1]
    if (!fileName) return

    const fullPath = `guest-login-system/inventory-management-system/public/inventory-photos/${fileName}`
    const fileUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${fullPath}?ref=${BRANCH}`

    const getRes = await fetch(fileUrl, {
      headers: { Authorization: `Bearer ${GITHUB_TOKEN}` },
    })

    if (getRes.ok) {
      const fileData = await getRes.json()
      await fetch(fileUrl, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Delete photo ${fileName}`,
          sha: fileData.sha,
          branch: BRANCH,
        }),
      })
    }
  } catch {
    // Best-effort cleanup
  }
}

export { EMPTY }
