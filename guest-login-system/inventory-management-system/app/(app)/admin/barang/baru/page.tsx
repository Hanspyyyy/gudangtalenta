'use client'
import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Camera, Save } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { addItem } from '@/lib/inventory-client'

// Downscale/compress the selected image before uploading so photos transfer quickly to Blob storage.
function downscaleImage(file: File, maxSize = 800, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('Canvas tidak didukung'))
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.onerror = () => reject(new Error('Gagal memproses gambar'))
      img.src = String(reader.result)
    }
    reader.onerror = () => reject(new Error('Gagal membaca berkas'))
    reader.readAsDataURL(file)
  })
}

export default function TambahBarangPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  async function handlePhoto(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Ukuran foto maksimal 10 MB.')
      return
    }
    try {
      setPreview(await downscaleImage(file))
    } catch {
      toast.error('Gagal memproses foto. Coba gambar lain.')
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const name = String(form.get('name') ?? '').trim()
    const size = String(form.get('size') ?? '').trim()
    const category = String(form.get('category') ?? '').trim()
    const warehouse = String(form.get('warehouse') ?? '').trim()
    const rack = String(form.get('rack') ?? '').trim() || '-'
    const stock = Number(form.get('stock'))
    if (!name || !size || !category || !warehouse || !Number.isInteger(stock) || stock < 0) {
      toast.error('Lengkapi data barang dengan nilai yang valid.')
      return
    }
    setSaving(true)
    const result = await addItem({ name, size, category, warehouse, rack, stock, photo: preview })
    if (!result.ok) {
      setSaving(false)
      toast.error(result.error)
      return
    }
    toast.success('Barang berhasil disimpan.')
    router.push('/aktivitas')
  }

  return (
    <main className="flex flex-col gap-6 px-4 py-5">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon" aria-label="Kembali">
          <Link href="/dashboard">
            <ArrowLeft className="size-5" aria-hidden="true" />
          </Link>
        </Button>
        <div>
          <p className="text-sm text-muted-foreground">Admin gudang</p>
          <h1 className="text-2xl font-semibold tracking-tight">Tambah Barang</h1>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 rounded-2xl border bg-card p-4 shadow-sm">
        <div className="grid gap-2">
          <Label htmlFor="photo">Foto Barang</Label>
          <label
            htmlFor="photo"
            className="flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-muted/40 px-4 py-5 text-center"
          >
            {preview ? (
              <img src={preview || '/placeholder.svg'} alt="Pratinjau barang" className="max-h-40 rounded-lg object-contain" />
            ) : (
              <>
                <Camera className="size-6 text-muted-foreground" aria-hidden="true" />
                <span className="text-sm font-medium">Ambil foto atau unggah gambar</span>
                <span className="text-xs text-muted-foreground">JPG, PNG hingga 10 MB</span>
              </>
            )}
          </label>
          <Input id="photo" name="photo" type="file" accept="image/*" capture="environment" onChange={handlePhoto} className="sr-only" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="name">Nama Barang</Label>
          <Input id="name" name="name" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="size">Ukuran</Label>
          <Input id="size" name="size" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="category">Kategori</Label>
          <Input id="category" name="category" required />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="warehouse">Gudang</Label>
            <select
              id="warehouse"
              name="warehouse"
              defaultValue="Gudang 1"
              required
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="Gudang 1">Gudang 1</option>
              <option value="Gudang 2">Gudang 2</option>
            </select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="rack">Rak</Label>
            <Input id="rack" name="rack" defaultValue="-" placeholder="-" />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="stock">Stok Awal</Label>
          <Input id="stock" name="stock" type="number" min="0" step="1" defaultValue={0} required />
        </div>
        <Button type="submit" disabled={saving} className="h-11 w-full">
          <Save className="size-4" aria-hidden="true" />
          {saving ? 'Menyimpan...' : 'Simpan Barang'}
        </Button>
      </form>
    </main>
  )
}
