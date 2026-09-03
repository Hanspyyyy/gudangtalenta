import { ArrowDownToLine } from 'lucide-react'
import { requireAdminPage } from '@/lib/auth'
import { PageHeader } from '@/components/page-header'
import { ComingSoon } from '@/components/coming-soon'

export default async function MasukPage() {
  await requireAdminPage()
  return (
    <div className="flex flex-col">
      <PageHeader title="Barang Masuk" backHref="/" />
      <ComingSoon
        icon={ArrowDownToLine}
        title="Transaksi Barang Masuk"
        description="Menambah stok barang ke lokasi tertentu, lengkap dengan foto dan keterangan. Fitur ini aktif pada tahap inventory engine berikutnya."
      />
    </div>
  )
}
