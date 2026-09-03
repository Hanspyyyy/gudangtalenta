import { ArrowUpFromLine } from 'lucide-react'
import { requireAdminPage } from '@/lib/auth'
import { PageHeader } from '@/components/page-header'
import { ComingSoon } from '@/components/coming-soon'

export default async function KeluarPage() {
  await requireAdminPage()
  return (
    <div className="flex flex-col">
      <PageHeader title="Barang Keluar" backHref="/" />
      <ComingSoon
        icon={ArrowUpFromLine}
        title="Transaksi Barang Keluar"
        description="Mengeluarkan stok dari lokasi tertentu dengan foto wajib dan validasi stok. Fitur ini aktif pada tahap inventory engine berikutnya."
      />
    </div>
  )
}
