import { cn } from '@/lib/utils'
import { ArrowDownToLine, ArrowUpFromLine, SlidersHorizontal, TriangleAlert } from 'lucide-react'

/** "Barang masuk" pill — shown for 7 days after an IN transaction. */
export function MasukBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-xs font-medium text-success',
        className,
      )}
    >
      <ArrowDownToLine className="size-3" aria-hidden="true" />
      Barang masuk
    </span>
  )
}

export function KeluarBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-destructive/15 px-2 py-0.5 text-xs font-medium text-destructive',
        className,
      )}
    >
      <ArrowUpFromLine className="size-3" aria-hidden="true" />
      Barang keluar
    </span>
  )
}

export function KoreksiBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground',
        className,
      )}
    >
      <SlidersHorizontal className="size-3" aria-hidden="true" />
      Koreksi
    </span>
  )
}

/** "Stok menipis" warning pill. */
export function StokMenipisBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-warning/20 px-2 py-0.5 text-xs font-medium text-warning-foreground',
        className,
      )}
    >
      <TriangleAlert className="size-3" aria-hidden="true" />
      Stok menipis
    </span>
  )
}
