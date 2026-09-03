import Link from 'next/link'
import { Settings2, ChevronRight, TriangleAlert } from 'lucide-react'
import { requireProfile } from '@/lib/auth'
import { isAdminRole } from '@/lib/types'
import { getDashboardStats } from '@/lib/queries/dashboard'
import { BrandLogo } from '@/components/brand-logo'
import { DashboardLive } from '@/components/dashboard/dashboard-live'

const EMPTY_STATS = { totalProducts: 0, totalCategories: 0, totalWarehouses: 0, totalRacks: 0 }
export default async function HomePage() {
  const profile = await requireProfile(); const admin = isAdminRole(profile.role)
  const stats = admin ? await getDashboardStats() : EMPTY_STATS
  return <div className="flex flex-col"><header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/90 px-4 py-3 backdrop-blur-md"><BrandLogo size="sm" />{admin && <Link href="/admin" aria-label="Pengaturan admin" className="grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-secondary"><Settings2 className="size-5" aria-hidden="true" /></Link>}</header><div className="flex flex-col gap-6 px-4 py-5"><section><p className="text-sm text-muted-foreground">{profile.full_name ? `Halo, ${profile.full_name.split(' ')[0]}` : 'Selamat datang'}</p><h2 className="mt-0.5 text-2xl font-semibold tracking-tight text-balance">Selamat datang di Gudang Talenta</h2><p className="mt-1.5 text-sm text-muted-foreground">Kelola dan pantau persediaan gudang dengan mudah.</p></section><DashboardLive initial={stats} isAdmin={admin} /><section className="flex flex-col gap-3"><h3 className="text-base font-semibold">Stok Menipis</h3><div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-card/50 px-4 py-8 text-center"><TriangleAlert className="size-5 text-muted-foreground" aria-hidden="true" /><p className="text-sm text-muted-foreground">Barang dengan stok di bawah ambang batas akan ditampilkan di sini.</p></div></section><Link href="/aktivitas" className="flex items-center justify-end gap-1 text-sm font-medium text-primary">Lihat semua aktivitas <ChevronRight className="size-4" aria-hidden="true" /></Link></div></div>
}
