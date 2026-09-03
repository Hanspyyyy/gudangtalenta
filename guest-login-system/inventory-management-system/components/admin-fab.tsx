'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, PackagePlus, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react'
import { cn } from '@/lib/utils'

const actions = [
  {
    href: '/admin/barang/baru',
    label: 'Tambah Barang',
    icon: PackagePlus,
    tone: 'text-primary',
  },
  {
    href: '/masuk',
    label: 'Barang Masuk',
    icon: ArrowDownToLine,
    tone: 'text-success',
  },
  {
    href: '/keluar',
    label: 'Barang Keluar',
    icon: ArrowUpFromLine,
    tone: 'text-destructive',
  },
]

export function AdminFab() {
  const [open, setOpen] = useState(false)

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50">
      <div className="mx-auto max-w-2xl px-4">
        <div className="relative flex justify-end pb-[calc(4.75rem+env(safe-area-inset-bottom,0px))]">
          {/* Backdrop */}
          {open && (
            <button
              type="button"
              aria-label="Tutup menu aksi"
              onClick={() => setOpen(false)}
              className="pointer-events-auto fixed inset-0 z-0 bg-background/60 backdrop-blur-[2px]"
            />
          )}

          <div className="pointer-events-auto relative z-10 flex flex-col items-end gap-3">
            {/* Action items */}
            <div
              className={cn(
                'flex flex-col items-end gap-2.5 transition-all duration-200',
                open
                  ? 'pointer-events-auto translate-y-0 opacity-100'
                  : 'pointer-events-none translate-y-2 opacity-0',
              )}
            >
              {actions.map(({ href, label, icon: Icon, tone }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-full border border-border bg-card py-2 pl-4 pr-2 shadow-lg"
                >
                  <span className="text-sm font-medium">{label}</span>
                  <span
                    className={cn(
                      'grid size-9 place-items-center rounded-full bg-secondary',
                      tone,
                    )}
                  >
                    <Icon className="size-4.5" aria-hidden="true" />
                  </span>
                </Link>
              ))}
            </div>

            {/* Main FAB */}
            <button
              type="button"
              aria-label={open ? 'Tutup menu aksi admin' : 'Buka menu aksi admin'}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="grid size-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/25 transition-transform active:scale-95"
            >
              <Plus
                className={cn(
                  'size-6 transition-transform duration-200',
                  open && 'rotate-45',
                )}
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
