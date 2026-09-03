import { PageHeader } from '@/components/page-header'
import { MasterDataManager } from '@/components/admin/master-data-manager'
import { createClient } from '@/lib/supabase/server'
import { upsertUnit, toggleUnitActive } from '@/lib/actions/master-data'

export default async function SatuanPage() {
  const supabase = await createClient()
  const { data = [] } = await supabase.from('units').select('id,name,abbreviation,is_active').order('name')
  return <main><PageHeader eyebrow="Master data" title="Satuan" description="Tentukan satuan yang digunakan tiap barang." /><MasterDataManager entityLabel="Satuan" fields={[{ name: 'name', label: 'Nama satuan', type: 'text', required: true, placeholder: 'Contoh: Pieces' }, { name: 'abbreviation', label: 'Singkatan', type: 'text', placeholder: 'Contoh: pcs' }]} items={data.map((x) => ({ id: x.id, is_active: x.is_active, primary: x.name, secondary: x.abbreviation, values: { name: x.name, abbreviation: x.abbreviation ?? '' } }))} emptyLabel="Tambahkan satuan seperti pcs, unit, atau meter." onSubmit={(v, id) => upsertUnit({ name: v.name ?? '', abbreviation: v.abbreviation, id })} onToggle={(id, active) => toggleUnitActive(id, active)} /></main>
}
