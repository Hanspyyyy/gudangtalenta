export type Role = 'super_admin' | 'admin' | 'user'

export type Profile = {
  id: string
  full_name: string | null
  role: Role
  is_active: boolean
  created_at: string
  updated_at: string
}

export type Category = {
  id: string
  name: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export type Unit = {
  id: string
  name: string
  abbreviation: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type Warehouse = {
  id: string
  name: string
  location: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type Rack = {
  id: string
  warehouse_id: string
  name: string
  zone: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type ProductSpecification = {
  id: string
  product_id: string
  spec_key: string
  spec_value: string
  spec_unit: string | null
  sort_order: number
  created_at: string
}

export type Product = {
  id: string
  name: string
  category_id: string | null
  unit_id: string | null
  description: string | null
  image_url: string | null
  threshold_stock: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export type ProductWithRelations = Product & {
  category: Pick<Category, 'id' | 'name'> | null
  unit: Pick<Unit, 'id' | 'name' | 'abbreviation'> | null
  product_specifications: ProductSpecification[]
}

export const ROLE_LABEL: Record<Role, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin Gudang',
  user: 'User',
}

export function isAdminRole(role: Role | undefined | null): boolean {
  return role === 'admin' || role === 'super_admin'
}
