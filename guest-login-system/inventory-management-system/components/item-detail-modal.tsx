'use client'

import { useState } from 'react'
import { X, Trash2, PackagePlus, PackageMinus, Check, MessageCircle } from 'lucide-react'
import { ProductImage } from '@/components/product-image'
import { adjustLocalItemStock, deleteLocalItem, type LocalItem } from '@/lib/local-inventory'
import { toast } from 'sonner'

type Mode = 'in' | 'out' | null

const WHATSAPP_NUMBER = '6288289508218'

export function ItemDetailModal({ item, isAdmin, onClose }: { item: LocalItem | null; isAdmin: boolean; onClose: () => void }) {
  const [mode, setMode] = useState<Mode>(null)
  const [quantity, setQuantity] = useState('')
  const [showRequest, setShowRequest] = useState(false)
  const [reqQuantity, setReqQuantity] = useState('')
  const [reqProject, setReqProject] = useState('')
  const [reqReceiver, setReqReceiver] = useState('')

  if (!item) return null

  const resetFlow = () => {
    setMode(null)
    setQuantity('')
  }

  const submitRequest = () => {
    const qty = Number(reqQuantity)
    if (!reqQuantity || !Number.isFinite(qty) || qty <= 0) {
      toast.error('Masukkan jumlah yang dibutuhkan.')
      return
    }
    if (!reqProject.trim()) {
      toast.error('Isi proyek / lokasi.')
      return
    }
    if (!reqReceiver.trim()) {
      toast.error('Isi nama penerima.')
      return
    }

    const rack = item.rack || '-'
    const lines = [
      '*Permintaan Stok Gudang*',
      `*Nama Barang:* ${item.name}`,
      `*Ukuran:* ${item.size}`,
      `*Gudang:* ${item.warehouse} (Rak: ${rack})`,
      `*Jumlah Dibutuhkan:* ${qty} unit`,
      `*Stok Tersedia:* ${item.stock} unit`,
      `*Nama Penerima:* ${reqReceiver.trim()}`,
      `*Proyek / Lokasi:* ${reqProject.trim()}`,
    ]
    if (qty > item.stock) {
      lines.push(`*Catatan:* Stok di gudang hanya tersedia ${item.stock}, masih kurang ${qty - item.stock} unit.`)
    }

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`
    window.open(url, '_blank', 'noopener,noreferrer')
    onClose()
  }

  const confirmAdjust = () => {
    const qty = Number(quantity)
    const result = adjustLocalItemStock(item.id, mode as 'in' | 'out', qty)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    toast.success(mode === 'in' ? 'Stok berhasil ditambahkan.' : 'Barang berhasil dikeluarkan.')
    onClose()
  }

  const handleDelete = () => {
    const result = deleteLocalItem(item.id)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    toast.success('Barang berhasil dihapus.')
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-foreground/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Detail ${item.name}`}
      onClick={onClose}
    >
      <article
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border bg-card p-5 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Detail Barang</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="grid size-9 place-items-center rounded-full hover:bg-secondary"
          >
            <X className="size-5" />
          </button>
        </div>
        <ProductImage src={item.photo} alt={item.name} className="mt-4 h-48 w-full rounded-2xl" />
        <h3 className="mt-4 text-xl font-semibold">{item.name}</h3>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <Detail label="Kategori" value={item.category} />
          <Detail label="Ukuran" value={item.size} />
          <Detail label="Stok" value={`${item.stock} unit`} />
          <Detail label="Gudang" value={item.warehouse} />
          <Detail label="Rak" value={item.rack || '-'} />
        </dl>

        {!isAdmin && (
          <div className="mt-6 flex flex-col gap-3">
            {showRequest ? (
              <div className="flex flex-col gap-3 rounded-2xl border bg-secondary/40 p-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="req-qty" className="text-sm font-medium">
                    Jumlah Dibutuhkan
                  </label>
                  <input
                    id="req-qty"
                    type="number"
                    min="1"
                    step="1"
                    autoFocus
                    value={reqQuantity}
                    onChange={(event) => setReqQuantity(event.target.value)}
                    placeholder="Masukkan jumlah"
                    className="h-11 rounded-xl border border-input bg-background px-3 text-base outline-none focus-visible:ring-2"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="req-project" className="text-sm font-medium">
                    Proyek / Lokasi
                  </label>
                  <input
                    id="req-project"
                    type="text"
                    value={reqProject}
                    onChange={(event) => setReqProject(event.target.value)}
                    placeholder="Nama proyek atau lokasi"
                    className="h-11 rounded-xl border border-input bg-background px-3 text-base outline-none focus-visible:ring-2"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="req-receiver" className="text-sm font-medium">
                    Nama Penerima
                  </label>
                  <input
                    id="req-receiver"
                    type="text"
                    value={reqReceiver}
                    onChange={(event) => setReqReceiver(event.target.value)}
                    placeholder="Nama penerima"
                    className="h-11 rounded-xl border border-input bg-background px-3 text-base outline-none focus-visible:ring-2"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowRequest(false)}
                    className="h-11 flex-1 rounded-xl border bg-card font-medium hover:bg-secondary"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={submitRequest}
                    className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-primary font-medium text-primary-foreground"
                  >
                    <MessageCircle className="size-4" />
                    Kirim
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowRequest(true)}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary font-medium text-primary-foreground"
              >
                <MessageCircle className="size-4" />
                Butuhkan Barang
              </button>
            )}
          </div>
        )}

        {isAdmin && (
          <div className="mt-6 flex flex-col gap-3">
            {mode ? (
              <div className="flex flex-col gap-3 rounded-2xl border bg-secondary/40 p-4">
                <label htmlFor="adjust-qty" className="text-sm font-medium">
                  {mode === 'in' ? 'Jumlah barang masuk' : 'Jumlah barang keluar'}
                </label>
                <input
                  id="adjust-qty"
                  type="number"
                  min="1"
                  step="1"
                  autoFocus
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                  placeholder="Masukkan jumlah"
                  className="h-11 rounded-xl border border-input bg-background px-3 text-base outline-none focus-visible:ring-2"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={resetFlow}
                    className="h-11 flex-1 rounded-xl border bg-card font-medium hover:bg-secondary"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={confirmAdjust}
                    className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-primary font-medium text-primary-foreground"
                  >
                    <Check className="size-4" />
                    Konfirmasi
                  </button>
                </div>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setMode('in')}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary font-medium text-primary-foreground"
                >
                  <PackagePlus className="size-4" />
                  Tambah Stok / Barang Masuk
                </button>
                <button
                  type="button"
                  onClick={() => setMode('out')}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border bg-card font-medium hover:bg-secondary"
                >
                  <PackageMinus className="size-4" />
                  Kirim Barang / Barang Keluar
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-destructive font-medium text-destructive-foreground"
                >
                  <Trash2 className="size-4" />
                  Hapus Barang
                </button>
              </>
            )}
          </div>
        )}
      </article>
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-secondary/60 p-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-medium">{value}</dd>
    </div>
  )
}
