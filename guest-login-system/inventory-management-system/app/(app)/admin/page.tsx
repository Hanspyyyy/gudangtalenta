import Link from 'next/link'
import { ArrowRight, Boxes, Container, Layers3, Ruler, Tags, Users } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { requireAdminPage } from '@/lib/auth'

const links = [
  { href: '/admin/barang', label: 'Manajemen Barang', description: 'Barang, foto, spesifikasi, dan threshold', icon: Boxes },
  { href: '/admin/kategori', label: 'Kategori', description: 'Kelompokkan barang secara rapi', icon: Tags },
  { href: '/admin/satuan', label: 'Satuan', description: 'pcs, unit, meter, kg, dan lainnya', icon: Ruler },
  { href: '/admin/gudang', label: 'Gudang', description: 'Atur area gudang yang tersedia', icon: Container },
  { href: '/admin/rak', label: 'Rak', description: 'Kelola rak dan zona penyimpanan', icon: Layers3 },
  { href: '/admin/user', label: 'User', description: 'Role dan status akun', icon: Users },
]

export default async function AdminPage() {
  await requireAdminPage()
  return <main className="space-y-6"><PageHeader eyebrow="Administrasi" title="Pengaturan gudang" description="Kelola data dasar yang digunakan seluruh sistem." />
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{links.map(({ href, label, description, icon: Icon }) => <Link key={href} href={href}><Card className="h-full transition-colors hover:border-primary/40"><CardContent className="flex items-center gap-4 p-5"><div className="rounded-xl bg-primary/10 p-3 text-primary"><Icon className="size-5" /></div><div className="min-w-0 flex-1"><h2 className="font-semibold">{label}</h2><p className="mt-1 text-sm text-muted-foreground">{description}</p></div><ArrowRight className="size-4 text-muted-foreground" /></CardContent></Card></Link>)}</div>
  </main>
}
