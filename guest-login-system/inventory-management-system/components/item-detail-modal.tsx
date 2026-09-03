'use client'

import { useState } from 'react'
import { X, Trash2 } from 'lucide-react'
import { ProductImage } from '@/components/product-image'
import { deleteLocalItem, type LocalItem } from '@/lib/local-inventory'
import { toast } from 'sonner'

export function ItemDetailModal({ item, isAdmin, onClose }: { item: LocalItem | null; isAdmin: boolean; onClose: () => void }) {
  if (!item) return null
  return <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/50 p-4" role="dialog" aria-modal="true" aria-label={`Detail ${item.name}`} onClick={onClose}>
    <article className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border bg-card p-5 shadow-xl" onClick={(event) => event.stopPropagation()}>
      <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">Detail Barang</h2><button type="button" onClick={onClose} aria-label="Tutup" className="grid size-9 place-items-center rounded-full hover:bg-secondary"><X className="size-5" /></button></div>
      <ProductImage src={item.photo} alt={item.name} className="mt-4 h-48 w-full rounded-2xl" />
      <h3 className="mt-4 text-xl font-semibold">{item.name}</h3>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm"><Detail label="Kategori" value={item.category} /><Detail label="Ukuran" value={item.size} /><Detail label="Stok" value={`${item.stock} unit`} /><Detail label="Gudang" value={item.warehouse} /><Detail label="Rak" value={item.rack || '-'} /></dl>
      {isAdmin && <button type="button" onClick={() => { deleteLocalItem(item.id); toast.success('Barang berhasil dihapus.'); onClose() }} className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-destructive text-destructive-foreground"><Trash2 className="size-4" />Hapus Barang</button>}
    </article>
  </div>
}
function Detail({ label, value }: { label: string; value: string }) { return <div className="rounded-xl bg-secondary/60 p-3"><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 font-medium">{value}</dd></div> }
