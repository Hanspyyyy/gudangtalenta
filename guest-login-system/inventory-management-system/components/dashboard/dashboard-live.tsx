'use client'
import { useMemo, useState } from 'react'
import { Package, Tags, Warehouse, Grid3x3 } from 'lucide-react'
import { StatCard } from '@/components/dashboard/stat-card'
import { ItemDetailModal } from '@/components/item-detail-modal'
import { useInventory, type LocalItem } from '@/lib/inventory-client'

const WAREHOUSES = ['Gudang 1', 'Gudang 2']

export function DashboardLive({
  initial,
  isAdmin = false,
}: {
  initial: { totalProducts: number; totalCategories: number; totalWarehouses: number; totalRacks: number }
  isAdmin?: boolean
}) {
  const { items, activity } = useInventory()
  const [warehouse, setWarehouse] = useState('Gudang 1')
  const [selected, setSelected] = useState<LocalItem | null>(null)

  const localCategories = useMemo(() => new Set(items.map((i) => i.category)).size, [items])
  const filtered = useMemo(
    () => items.filter((i) => (i.warehouse === 'Gudang 2' ? 'Gudang 2' : 'Gudang 1') === warehouse),
    [items, warehouse],
  )

  return (
    <>
      <section aria-label="Ringkasan gudang">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Jenis Barang" value={initial.totalProducts + items.length} icon={Package} tone="primary" />
          <StatCard label="Kategori" value={initial.totalCategories + localCategories} icon={Tags} tone="neutral" />
          <StatCard label="Gudang" value={2} icon={Warehouse} tone="neutral" />
          <StatCard label="Rak" value={new Set(items.map((i) => i.rack || '-')).size} icon={Grid3x3} tone="neutral" />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-base font-semibold">Stok Tersedia</h3>
        <div className="flex flex-wrap gap-2">
          {WAREHOUSES.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setWarehouse(name)}
              aria-pressed={warehouse === name}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                warehouse === name
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'bg-card text-muted-foreground hover:bg-secondary'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
        {filtered.length === 0 ? (
          <p className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            Belum ada barang di {warehouse}.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {filtered.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelected(item)}
                className="flex items-center gap-3 rounded-xl border bg-card p-3 text-left transition-colors hover:bg-secondary"
              >
                <div className="size-12 shrink-0 overflow-hidden rounded-lg bg-secondary">
                  <img src={item.photo || '/placeholder.svg'} alt="" className="size-full object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium">{item.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {item.category} · {item.stock} unit · Rak: {item.rack || '-'}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="activity-heading" className="flex flex-col gap-3">
        <h3 id="activity-heading" className="text-base font-semibold">
          Aktifitas Terbaru
        </h3>
        {activity.length === 0 ? (
          <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            Belum ada aktivitas
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {activity.slice(0, 4).map((log) => (
              <div key={log.id} className="rounded-xl border bg-card p-3">
                <p className="text-sm font-medium">{log.message}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {new Date(log.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {selected && <ItemDetailModal item={selected} isAdmin={isAdmin} onClose={() => setSelected(null)} />}
    </>
  )
}
