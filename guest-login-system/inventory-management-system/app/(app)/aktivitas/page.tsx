import { PageHeader } from '@/components/page-header'
import { ActivityScaffold } from '@/components/activity/activity-scaffold'

export default function AktivitasPage() {
  return (
    <div className="flex flex-col">
      <PageHeader title="Aktivitas" description="Histori transaksi gudang" />
      <div className="pt-3">
        <ActivityScaffold />
      </div>
    </div>
  )
}
