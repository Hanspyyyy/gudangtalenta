import { PageHeader } from '@/components/page-header'
import { MasterDataManager } from '@/components/admin/master-data-manager'
import { createClient } from '@/lib/supabase/server'
import { upsertWarehouse, toggleWarehouseActive } from '@/lib/actions/master-data'

export default async function GudangPage() {
  const supabase = await createClient()
  const { data = [] } = await supabase.from('warehouses').select('id,name,location,is_active').order('name')
  return <main><PageHeader eyebrow="Master data" title="Gudang" description="Kelola lokasi gudang yang aktif." /><MasterDataManager entityLabel="Gudang" fields={[{ name: 'name', label: 'Nama gudang', type: 'text', required: true, placeholder: 'Contoh: Gudang Utama' }, { name: 'location', label: 'Keterangan lokasi', type: 'text', placeholder: 'Contoh: Lantai 1' }]} items={data.map((x) => ({ id: x.id, is_active: x.is_active, primary: x.name, secondary: x.location, values: { name: x.name, location: x.location ?? '' } }))} emptyLabel="Tambahkan gudang pertama untuk mulai mengatur lokasi." onSubmit={(v, id) => upsertWarehouse({ name: v.name ?? '', location: v.location, id })} onToggle={(id, active) => toggleWarehouseActive(id, active)} /></main>
}
