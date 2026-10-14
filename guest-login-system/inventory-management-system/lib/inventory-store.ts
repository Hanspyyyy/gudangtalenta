import 'server-only'
import type { InventoryData, LocalItem } from '@/lib/inventory-types'

const REPO_OWNER = 'Hanspyyy'
const REPO_NAME = 'gudangtalenta'
const FILE_PATH = 'data/inventory.json'
const BRANCH = 'main'
const EMPTY: InventoryData = { items: [], activity: [] }
let writeChain: Promise<unknown> = Promise.resolve()

type GitHubFile = { content?: string; sha?: string; message?: string }

function githubHeaders() {
  const token = process.env.GITHUB_TOKEN
  if (!token) throw new Error('GITHUB_TOKEN belum dikonfigurasi')
  return { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' }
}

function fileUrl(path = FILE_PATH) {
  return `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`
}

function normalize(data: unknown): InventoryData {
  if (Array.isArray(data)) return { items: data as LocalItem[], activity: [] }
  const value = (data ?? {}) as Partial<InventoryData>
  return { items: Array.isArray(value.items) ? value.items : [], activity: Array.isArray(value.activity) ? value.activity : [] }
}

async function getGitHubFile(): Promise<GitHubFile | null> {
  const response = await fetch(`${fileUrl()}?ref=${BRANCH}`, { headers: githubHeaders(), cache: 'no-store' })
  if (response.status === 404) return null
  const payload = (await response.json()) as GitHubFile
  if (!response.ok) throw new Error(`Gagal mengambil data dari GitHub (${response.status}): ${payload.message ?? 'Unknown error'}`)
  return payload
}

export async function readInventory(): Promise<InventoryData> {
  try {
    const file = await getGitHubFile()
    if (!file?.content) return { ...EMPTY, items: [], activity: [] }
    return normalize(JSON.parse(Buffer.from(file.content, 'base64').toString('utf8')))
  } catch (error) {
    console.error('Error readInventory:', error)
    return { ...EMPTY, items: [], activity: [] }
  }
}

async function writeInventory(data: InventoryData, sha?: string) {
  const body: Record<string, string> = {
    message: sha ? 'Update inventory via app' : 'Create inventory via app',
    content: Buffer.from(JSON.stringify(normalize(data), null, 2)).toString('base64'),
    branch: BRANCH,
  }
  if (sha) body.sha = sha
  const response = await fetch(fileUrl(), { method: 'PUT', headers: { ...githubHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  const payload = (await response.json()) as GitHubFile
  if (!response.ok) throw new Error(`Gagal menyimpan data ke GitHub (${response.status}): ${payload.message ?? 'Unknown error'}`)
}

export async function mutateInventory<T>(mutator: (data: InventoryData) => { data: InventoryData; result: T }): Promise<T> {
  const run = writeChain.then(async () => {
    const file = await getGitHubFile()
    const current = file?.content ? normalize(JSON.parse(Buffer.from(file.content, 'base64').toString('utf8'))) : { ...EMPTY }
    const { data, result } = mutator(current)
    await writeInventory(data, file?.sha)
    return result
  })
  writeChain = run.then(() => undefined, () => undefined)
  return run
}

export async function uploadPhoto(dataUrl: string, id: string): Promise<string | null> {
  if (!dataUrl) return null
  if (!dataUrl.startsWith('data:')) return dataUrl
  try {
    const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/s)
    if (!match) throw new Error('Format foto tidak valid')
    const [, contentType, content] = match
    const extension = (contentType.split('/')[1] || 'jpeg').replace(/[^a-z0-9]/gi, '')
    const fileName = `${id}-${Date.now()}.${extension}`
    const path = `public/inventory-photos/${fileName}`
    const response = await fetch(fileUrl(path), { method: 'PUT', headers: { ...githubHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify({ message: `Upload photo ${fileName}`, content, branch: BRANCH }) })
    if (!response.ok) throw new Error(`Gagal upload foto ke GitHub (${response.status})`)
    return `/inventory-photos/${fileName}`
  } catch (error) {
    console.error('Error uploadPhoto:', error)
    return null
  }
}

export async function deletePhoto(item: LocalItem | undefined): Promise<void> {
  const photo = item && ((item as LocalItem & { photo_url?: string; photo?: string }).photo_url || item.photo)
  if (!photo?.includes('/inventory-photos/')) return
  const fileName = decodeURIComponent(photo.split('/inventory-photos/')[1] || '')
  if (!fileName) return
  try {
    const response = await fetch(`${fileUrl(`public/inventory-photos/${fileName}`)}?ref=${BRANCH}`, { headers: githubHeaders(), cache: 'no-store' })
    if (response.status === 404) return
    if (!response.ok) throw new Error(`Gagal mencari foto (${response.status})`)
    const file = (await response.json()) as GitHubFile
    if (!file.sha) return
    await fetch(fileUrl(`public/inventory-photos/${fileName}`), { method: 'DELETE', headers: { ...githubHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify({ message: `Delete photo ${fileName}`, sha: file.sha, branch: BRANCH }) })
  } catch (error) { console.error('Error deletePhoto:', error) }
}

export { EMPTY }
