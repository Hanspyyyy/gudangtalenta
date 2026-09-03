import Link from 'next/link'
import {
  Package,
  Tags,
  Ruler,
  Warehouse as WarehouseIcon,
  Grid3x3,
  Users,
  Bell,
  ChevronRight,
  ShieldCheck,
  CircleUser,
} from 'lucide-react'
import { requireProfile } from '@/lib/auth'
import { isAdminRole, ROLE_LABEL } from '@/lib/types'
import { PageHeader } from '@/components/page-header'
import { LogoutButton } from '@/components/logout-button'
import { cn } from '@/lib/utils'

const adminMenu = [
  { href: '/admin/barang', label: 'Manajemen Barang', icon: Package },
  { href: '/admin/kategori', label: 'Kategori', icon: Tags },
  { href: '/admin/satuan', label: 'Satuan', icon: Ruler },
  { href: '/admin/gudang', label: 'Gudang', icon: WarehouseIcon },
  { href: '/admin/rak', label: 'Rak', icon: Grid3x3 },
  { href: '/admin/user', label: 'Manajemen User', icon: Users },
  { href: '/admin/notifikasi', label: 'Notifikasi', icon: Bell },
]

export default async function ProfilPage() {
  const profile = await requireProfile()
  const admin = isAdminRole(profile.role)

  return (
    <div className="flex flex-col">
      <PageHeader title="Profil" />

      <div className="flex flex-col gap-6 px-4 py-5">
        {/* Identity card */}
        <section className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
          <div className="grid size-14 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
            <CircleUser className="size-8" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-semibold leading-tight">
              {profile.full_name || 'Tanpa Nama'}
            </p>
            <p className="truncate text-sm text-muted-foreground">
              {profile.id === 'guest' ? 'Akses publik' : profile.id}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                  admin
                    ? 'bg-primary/10 text-primary'
                    : 'bg-secondary text-secondary-foreground',
                )}
              >
                {admin && <ShieldCheck className="size-3" aria-hidden="true" />}
                {ROLE_LABEL[profile.role]}
              </span>
              <span
                className={cn(
                  'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                  profile.is_active
                    ? 'bg-success/15 text-success'
                    : 'bg-destructive/15 text-destructive',
                )}
              >
                {profile.is_active ? 'Akun Aktif' : 'Nonaktif'}
              </span>
            </div>
          </div>
        </section>

        {/* Admin management */}
        {admin && (
          <section aria-labelledby="admin-heading" className="flex flex-col gap-3">
            <h2
              id="admin-heading"
              className="px-1 text-sm font-semibold text-muted-foreground"
            >
              Pengaturan Admin
            </h2>
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              {adminMenu.map(({ href, label, icon: Icon }, i) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-secondary',
                    i !== 0 && 'border-t border-border',
                  )}
                >
                  <span className="grid size-9 place-items-center rounded-lg bg-secondary text-muted-foreground">
                    <Icon className="size-4.5" aria-hidden="true" />
                  </span>
                  <span className="flex-1 text-sm font-medium">{label}</span>
                  <ChevronRight
                    className="size-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                </Link>
              ))}
            </div>
          </section>
        )}

        {!admin && (
          <p className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground text-pretty">
            Anda masuk sebagai User. Anda dapat melihat barang, stok,
            spesifikasi, lokasi, dan histori transaksi.
          </p>
        )}

        <LogoutButton variant="outline" className="h-11 w-full" />
      </div>
    </div>
  )
}
