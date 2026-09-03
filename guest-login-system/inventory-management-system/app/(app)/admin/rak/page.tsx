import { PageHeader } from '@/components/page-header'
import { MasterDataManager } from '@/components/admin/master-data-manager'
import { createClient } from '@/lib/supabase/server'
import { upsertRack, toggleRackActive } from '@/lib/actions/master-data'

export default async function RakPage() {
  const supabase = await createClient()
  const [{ data: racks = [] }, { data: warehouses = [] }] = await Promise.all([supabase.from('racks').select('id,name,zone,is_active,warehouse_id').order('name'), supabase.from('warehouses').select('id,name').eq('is_active', true).order('name')])
  const warehouseMap = new Map(warehouses.map((x) => [x.id, x.name]))
  return <main><PageHeader eyebrow="Master data" title="Rak" description="Atur rak dan zona untuk setiap gudang." /><MasterDataManager entityLabel="Rak" fields={[{ name: 'warehouse_id', label: 'Gudang', type: 'select', required: true, options: warehouses.map((x) => ({ value: x.id, label: x.name })) }, { name: 'name', label: 'Nama rak', type: 'text', required: true, placeholder: 'Contoh: A-01' }, { name: 'zone', label: 'Zona (opsional)', type: 'text', placeholder: 'Contoh: Material' }]} items={racks.map((x) => ({ id: x.id, is_active: x.is_active, primary: x.name, secondary: `${warehouseMap.get(x.warehouse_id) ?? 'Gudang'}${x.zone ? ` · ${x.zone}` : ''}`, values: { name: x.name, zone: x.zone ?? '', warehouse_id: x.warehouse_id } }))} emptyLabel="Tambahkan rak setelah membuat gudang." onSubmit={(v, id) => upsertRack({ name: v.name ?? '', zone: v.zone, warehouse_id: v.warehouse_id ?? '', id })} onToggle={(id, active) => toggleRackActive(id, active)} /></main>
}
