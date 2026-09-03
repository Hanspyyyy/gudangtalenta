import { PageHeader } from '@/components/page-header'
import { MasterDataManager } from '@/components/admin/master-data-manager'
import { createClient } from '@/lib/supabase/server'
import { upsertCategory, toggleCategoryActive } from '@/lib/actions/master-data'

export default async function KategoriPage() {
  const supabase = await createClient()
  const { data = [] } = await supabase.from('categories').select('id,name,is_active').order('name')
  return <main><PageHeader eyebrow="Master data" title="Kategori" description="Kelompokkan barang agar mudah ditemukan." /><MasterDataManager entityLabel="Kategori" fields={[{ name: 'name', label: 'Nama kategori', type: 'text', required: true, placeholder: 'Contoh: Besi' }]} items={data.map((x) => ({ id: x.id, is_active: x.is_active, primary: x.name, values: { name: x.name } }))} emptyLabel="Tambahkan kategori pertama untuk mulai mengelola barang." onSubmit={(v, id) => upsertCategory({ name: v.name ?? '', id })} onToggle={(id, active) => toggleCategoryActive(id, active)} /></main>
}
