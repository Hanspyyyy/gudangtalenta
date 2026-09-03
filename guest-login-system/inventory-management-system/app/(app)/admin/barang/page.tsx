import { PageHeader } from '@/components/page-header'
import { ProductManager } from '@/components/admin/product-manager'
import { createClient } from '@/lib/supabase/server'
import { requireAdminPage } from '@/lib/auth'

export default async function BarangAdminPage() {
  await requireAdminPage()
  const supabase = await createClient()
  const [{ data: products = [] }, { data: categories = [] }, { data: units = [] }] = await Promise.all([
    supabase.from('products').select('id,name,description,image_url,threshold_stock,is_active,category_id,unit_id,category:categories(name),unit:units(name,abbreviation),product_specifications(spec_key,spec_value,spec_unit)').order('name'),
    supabase.from('categories').select('id,name').eq('is_active', true).order('name'),
    supabase.from('units').select('id,name,abbreviation').eq('is_active', true).order('name'),
  ])
  return <main><PageHeader eyebrow="Master data" title="Barang" description="Kelola barang, foto, threshold, dan spesifikasi fleksibel." /><ProductManager products={products as never[]} categories={categories} units={units} /></main>
}
