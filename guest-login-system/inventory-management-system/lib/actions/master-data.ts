'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { assertAdmin } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

export type ActionResult = { ok: boolean; error?: string }

function fail(error: string): ActionResult {
  return { ok: false, error }
}

async function guard(): Promise<ActionResult | null> {
  try {
    await assertAdmin()
    return null
  } catch (e) {
    const msg = (e as Error).message
    if (msg === 'FORBIDDEN')
      return fail('Anda tidak memiliki izin untuk aksi ini.')
    return fail('Sesi tidak valid. Silakan masuk kembali.')
  }
}

/* ----------------------------- CATEGORIES ----------------------------- */
const categorySchema = z.object({
  name: z.string().trim().min(1, 'Nama kategori wajib diisi').max(80),
})

export async function upsertCategory(
  input: { id?: string; name: string },
): Promise<ActionResult> {
  const denied = await guard()
  if (denied) return denied
  const parsed = categorySchema.safeParse(input)
  if (!parsed.success)
    return fail(parsed.error.issues[0]?.message ?? 'Data tidak valid')

  const supabase = await createClient()
  const payload = { name: parsed.data.name, updated_at: new Date().toISOString() }
  const { error } = input.id
    ? await supabase.from('categories').update(payload).eq('id', input.id)
    : await supabase.from('categories').insert({ name: parsed.data.name })

  if (error) {
    console.error('[v0] upsertCategory error:', error)
    return fail('Gagal menyimpan kategori.')
  }
  revalidatePath('/admin/kategori')
  return { ok: true }
}

export async function toggleCategoryActive(
  id: string,
  isActive: boolean,
): Promise<ActionResult> {
  const denied = await guard()
  if (denied) return denied
  const supabase = await createClient()
  const { error } = await supabase
    .from('categories')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) return fail('Gagal memperbarui status kategori.')
  revalidatePath('/admin/kategori')
  return { ok: true }
}

/* ------------------------------- UNITS -------------------------------- */
const unitSchema = z.object({
  name: z.string().trim().min(1, 'Nama satuan wajib diisi').max(40),
  abbreviation: z.string().trim().max(20).optional().or(z.literal('')),
})

export async function upsertUnit(input: {
  id?: string
  name: string
  abbreviation?: string
}): Promise<ActionResult> {
  const denied = await guard()
  if (denied) return denied
  const parsed = unitSchema.safeParse(input)
  if (!parsed.success)
    return fail(parsed.error.issues[0]?.message ?? 'Data tidak valid')

  const supabase = await createClient()
  const values = {
    name: parsed.data.name,
    abbreviation: parsed.data.abbreviation || null,
  }
  const { error } = input.id
    ? await supabase
        .from('units')
        .update({ ...values, updated_at: new Date().toISOString() })
        .eq('id', input.id)
    : await supabase.from('units').insert(values)

  if (error) {
    console.error('[v0] upsertUnit error:', error)
    return fail('Gagal menyimpan satuan.')
  }
  revalidatePath('/admin/satuan')
  return { ok: true }
}

export async function toggleUnitActive(
  id: string,
  isActive: boolean,
): Promise<ActionResult> {
  const denied = await guard()
  if (denied) return denied
  const supabase = await createClient()
  const { error } = await supabase
    .from('units')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) return fail('Gagal memperbarui status satuan.')
  revalidatePath('/admin/satuan')
  return { ok: true }
}

/* ----------------------------- WAREHOUSES ----------------------------- */
const warehouseSchema = z.object({
  name: z.string().trim().min(1, 'Nama gudang wajib diisi').max(80),
  location: z.string().trim().max(160).optional().or(z.literal('')),
})

export async function upsertWarehouse(input: {
  id?: string
  name: string
  location?: string
}): Promise<ActionResult> {
  const denied = await guard()
  if (denied) return denied
  const parsed = warehouseSchema.safeParse(input)
  if (!parsed.success)
    return fail(parsed.error.issues[0]?.message ?? 'Data tidak valid')

  const supabase = await createClient()
  const values = {
    name: parsed.data.name,
    location: parsed.data.location || null,
  }
  const { error } = input.id
    ? await supabase
        .from('warehouses')
        .update({ ...values, updated_at: new Date().toISOString() })
        .eq('id', input.id)
    : await supabase.from('warehouses').insert(values)

  if (error) {
    console.error('[v0] upsertWarehouse error:', error)
    return fail('Gagal menyimpan gudang.')
  }
  revalidatePath('/admin/gudang')
  revalidatePath('/admin/rak')
  return { ok: true }
}

export async function toggleWarehouseActive(
  id: string,
  isActive: boolean,
): Promise<ActionResult> {
  const denied = await guard()
  if (denied) return denied
  const supabase = await createClient()
  const { error } = await supabase
    .from('warehouses')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) return fail('Gagal memperbarui status gudang.')
  revalidatePath('/admin/gudang')
  return { ok: true }
}

/* -------------------------------- RACKS ------------------------------- */
const rackSchema = z.object({
  warehouse_id: z.string().uuid('Gudang wajib dipilih'),
  name: z.string().trim().min(1, 'Nama rak wajib diisi').max(60),
  zone: z.string().trim().max(60).optional().or(z.literal('')),
})

export async function upsertRack(input: {
  id?: string
  warehouse_id: string
  name: string
  zone?: string
}): Promise<ActionResult> {
  const denied = await guard()
  if (denied) return denied
  const parsed = rackSchema.safeParse(input)
  if (!parsed.success)
    return fail(parsed.error.issues[0]?.message ?? 'Data tidak valid')

  const supabase = await createClient()
  const values = {
    warehouse_id: parsed.data.warehouse_id,
    name: parsed.data.name,
    zone: parsed.data.zone || null,
  }
  const { error } = input.id
    ? await supabase
        .from('racks')
        .update({ ...values, updated_at: new Date().toISOString() })
        .eq('id', input.id)
    : await supabase.from('racks').insert(values)

  if (error) {
    console.error('[v0] upsertRack error:', error)
    return fail('Gagal menyimpan rak.')
  }
  revalidatePath('/admin/rak')
  return { ok: true }
}

export async function toggleRackActive(
  id: string,
  isActive: boolean,
): Promise<ActionResult> {
  const denied = await guard()
  if (denied) return denied
  const supabase = await createClient()
  const { error } = await supabase
    .from('racks')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) return fail('Gagal memperbarui status rak.')
  revalidatePath('/admin/rak')
  return { ok: true }
}

/* ------------------------------ PRODUCTS ------------------------------ */
const productSchema = z.object({
  name: z.string().trim().min(1, 'Nama barang wajib diisi').max(160),
  category_id: z.string().uuid('Kategori wajib dipilih'),
  unit_id: z.string().uuid('Satuan wajib dipilih'),
  description: z.string().trim().max(1000).optional().or(z.literal('')),
  threshold_stock: z.coerce.number().min(0, 'Threshold tidak boleh negatif'),
})

export async function upsertProduct(input: {
  id?: string
  name: string
  category_id: string
  unit_id: string
  description?: string
  threshold_stock: string | number
  image_url?: string
  specifications?: { spec_key: string; spec_value: string; spec_unit?: string }[]
}): Promise<ActionResult> {
  const denied = await guard()
  if (denied) return denied
  const parsed = productSchema.safeParse(input)
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? 'Data tidak valid')
  const supabase = await createClient()
  const productPayload = { ...parsed.data, image_url: input.image_url || null, updated_at: new Date().toISOString() }
  const result = input.id
    ? await supabase.from('products').update(productPayload).eq('id', input.id).select('id').single()
    : await supabase.from('products').insert(productPayload).select('id').single()
  if (result.error || !result.data) {
    console.error('[v0] upsertProduct error:', result.error)
    return fail('Gagal menyimpan barang.')
  }
  const productId = result.data.id
  if (input.id) {
    const { error } = await supabase.from('product_specifications').delete().eq('product_id', productId)
    if (error) return fail('Barang tersimpan, tetapi spesifikasi gagal diperbarui.')
  }
  const specs = (input.specifications ?? []).filter((s) => s.spec_key.trim() && s.spec_value.trim()).map((s, i) => ({ product_id: productId, spec_key: s.spec_key.trim(), spec_value: s.spec_value.trim(), spec_unit: s.spec_unit?.trim() || null, sort_order: i }))
  if (specs.length) {
    const { error } = await supabase.from('product_specifications').insert(specs)
    if (error) return fail('Barang tersimpan, tetapi spesifikasi gagal disimpan.')
  }
  revalidatePath('/admin/barang')
  revalidatePath('/cari')
  revalidatePath('/')
  return { ok: true }
}

export async function toggleProductActive(id: string, isActive: boolean): Promise<ActionResult> {
  const denied = await guard()
  if (denied) return denied
  const supabase = await createClient()
  const { error } = await supabase.from('products').update({ is_active: isActive, updated_at: new Date().toISOString() }).eq('id', id)
  if (error) return fail('Gagal memperbarui status barang.')
  revalidatePath('/admin/barang')
  revalidatePath('/cari')
  return { ok: true }
}

export async function uploadProductImage(formData: FormData): Promise<{ ok: boolean; url?: string; error?: string }> {
  const denied = await guard()
  if (denied) return denied
  const file = formData.get('file')
  if (!(file instanceof File) || file.size > 5 * 1024 * 1024 || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return { ok: false, error: 'Foto harus JPG, PNG, atau WebP dan maksimal 5 MB.' }
  const supabase = await createClient()
  const path = `${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '')}`
  const { error } = await supabase.storage.from('product-images').upload(path, file, { contentType: file.type, upsert: false })
  if (error) return { ok: false, error: 'Gagal mengunggah foto.' }
  const { data } = supabase.storage.from('product-images').getPublicUrl(path)
  return { ok: true, url: data.publicUrl }
}
