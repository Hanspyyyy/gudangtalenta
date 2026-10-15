import 'server-only'
import type { InventoryData, LocalItem } from '@/lib/inventory-types'

type GitHubFile = {
  content: string
  sha: string
  message?: string
}

const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const REPO_OWNER = 'Hanspyyyy'
const REPO_NAME = 'gudangtalenta'
const ROOT_PATH = 'guest-login-system/inventory-management-system'
const FILE_PATH = `${ROOT_PATH}/data/inventory.json`
const PHOTO_PATH = `${ROOT_PATH}/public/inventory-photos`
const BRANCH = 'main'

export const EMPTY: InventoryData = { items: [], activity: [] }
let writeChain: Promise<unknown> = Promise.resolve()

function githubHeaders() {
  if (!GITHUB_TOKEN) throw new Error('GITHUB_TOKEN belum dikonfigurasi')
  return {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
}

function fileUrl(path: string) {
  return `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`
}

export async function getGitHubFile(path = FILE_PATH): Promise<GitHubFile | null> {
  const response = await fetch(`${fileUrl(path)}?ref=${BRANCH}`, {
    headers: githubHeaders(),
    cache: 'no-store',
  })
  const payload = (await response.json()) as GitHubFile & { message?: string }
  if (response.status === 404) return null
  if (!response.ok) throw new Error(`Gagal mengambil data dari GitHub (${response.status}): ${payload.message ?? 'Unknown error'}`)
  return payload
}

function normalizeInventory(value: unknown): InventoryData {
  if (Array.isArray(value)) return { items: value, activity: [] }
  if (!value || typeof value !== 'object') return { ...EMPTY }
  const parsed = value as Partial<InventoryData>
  return {
    items: Array.isArray(parsed.items) ? parsed.items : [],
    activity: Array.isArray(parsed.activity) ? parsed.activity : [],
  }
}

function decodeInventory(file: GitHubFile): InventoryData {
  return normalizeInventory(JSON.parse(Buffer.from(file.content, 'base64').toString('utf-8')))
}

export async function readInventory(): Promise<InventoryData> {
  try {
    const file = await getGitHubFile(FILE_PATH)
    return file ? decodeInventory(file) : { ...EMPTY }
  } catch (err) {
    console.error('Error readInventory:', err)
    return { ...EMPTY }
  }
}

async function writeInventory(data: InventoryData, sha: string): Promise<void> {
  const response = await fetch(fileUrl(FILE_PATH), {
    method: 'PUT',
    headers: { ...githubHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'Update inventory via Mobile Web App',
      content: Buffer.from(JSON.stringify(data, null, 2)).toString('base64'),
      sha,
      branch: BRANCH,
    }),
  })
  const payload = (await response.json()) as GitHubFile
  if (!response.ok)
    throw new Error(
      `Gagal menyimpan data ke GitHub (${response.status}): ${payload.message ?? 'Unknown error'}`
    )
}

export async function mutateInventory<T>(
  mutator: (data: InventoryData) => { data: InventoryData; result: T }
): Promise<T> {
  const run = writeChain.then(async () => {
    let lastError: unknown

    // Always read immediately before writing. Retry once if another writer updated
    // the GitHub blob between the read and PUT (GitHub returns 409 in that case).
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const inventoryFile = await getGitHubFile(FILE_PATH)
      if (!inventoryFile) throw new Error('File inventory tidak tersedia di GitHub')

      const { data, result } = mutator(decodeInventory(inventoryFile))
      try {
        await writeInventory(data, inventoryFile.sha)
        return result
      } catch (error) {
        lastError = error
        if (!(error instanceof Error) || !error.message.includes('(409)') || attempt === 1) throw error
      }
    }

    throw lastError instanceof Error ? lastError : new Error('Gagal menyimpan inventaris')
  })
  writeChain = run.then(
    () => undefined,
    () => undefined
  )
  return run
}

export async function uploadPhoto(dataUrl: string, id: string): Promise<string | null> {
  if (!dataUrl) return null
  if (!dataUrl.startsWith('data:')) return dataUrl
  try {
    const match = dataUrl.match(/^data:([^;]+);base64,([\s\S]+)$/)
    if (!match) throw new Error('Format foto tidak valid')
    const [, contentType, content] = match
    const extension = (contentType.split('/')[1] || 'jpeg').replace(/[^a-z0-9]/gi, '')
    const fileName = `${id}-${Date.now()}.${extension}`
    const response = await fetch(fileUrl(`${PHOTO_PATH}/${fileName}`), {
      method: 'PUT',
      headers: { ...githubHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: `Upload photo ${fileName}`, content, branch: BRANCH }),
    })
    if (!response.ok) throw new Error(`Gagal upload foto ke GitHub (${response.status})`)
    return `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/${PHOTO_PATH}/${fileName}`
  } catch (err) {
    console.error('Error uploadPhoto:', err)
    return null
  }
}

export async function deletePhoto(item: LocalItem | undefined): Promise<void> {
  const photoPath = item?.photo_url || (item as any)?.photo
  if (!photoPath || !photoPath.includes('/inventory-photos/')) return
  try {
    const fileName = photoPath.split('/inventory-photos/')[1]
    if (!fileName) return
    const response = await fetch(`${fileUrl(`${PHOTO_PATH}/${fileName}`)}?ref=${BRANCH}`, {
      headers: githubHeaders(),
      cache: 'no-store',
    })
    if (response.status === 404) return
    if (!response.ok) throw new Error(`Gagal mencari foto (${response.status})`)
    const file = (await response.json()) as GitHubFile
    if (!file.sha) return
    await fetch(fileUrl(`${PHOTO_PATH}/${fileName}`), {
      method: 'DELETE',
      headers: { ...githubHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: `Delete photo ${fileName}`, sha: file.sha, branch: BRANCH }),
    })
  } catch (error) {
    console.error('Error deletePhoto:', error)
  }
}

