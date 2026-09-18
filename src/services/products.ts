import { supabase } from '../lib/supabase'
import { mapProduct } from '../lib/mappers'
import type { Product } from '../types/product'
import type { Category } from '../types/category'
import type { Manufacturer } from '../types/manufacturer'

export interface ProductFilters {
  categoryId?: string
  manufacturerId?: string
  query?: string
  isActive?: boolean
  isFeatured?: boolean
  limit?: number
  offset?: number
}

export interface PaginatedProducts {
  data: Product[]
  hasMore: boolean
  total: number
}

export async function fetchProducts(filters: ProductFilters = {}): Promise<PaginatedProducts> {
  const { categoryId, manufacturerId, query, isActive = true, isFeatured, limit = 20, offset = 0 } = filters

  let queryBuilder = supabase
    .from('products')
    .select('*, categories(name, slug), manufacturers(name)', { count: 'exact' })
    .eq('is_active', isActive)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (categoryId) {
    queryBuilder = queryBuilder.eq('category_id', categoryId)
  }
  if (manufacturerId) {
    queryBuilder = queryBuilder.eq('manufacturer_id', manufacturerId)
  }
  if (isFeatured !== undefined) {
    queryBuilder = queryBuilder.eq('is_featured', isFeatured)
  }
  if (query) {
    const sanitized = query.replace(/[,"]/g, ' ').replace(/%/g, '\\%').trim()
    if (sanitized) {
      queryBuilder = queryBuilder.or(`name.ilike.%${sanitized}%,brand.ilike.%${sanitized}%,generic_name.ilike.%${sanitized}%`)
    }
  }

  const { data, error, count } = await queryBuilder

  if (error) throw error

  return {
    data: (data || []).map(mapProduct),
    hasMore: (offset + limit) < (count || 0),
    total: count || 0,
  }
}

export async function fetchProductById(productId: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name, slug), manufacturers(name)')
    .eq('id', productId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return mapProduct(data)
}

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  if (error) throw error
  return (data || []) as Category[]
}

export async function fetchManufacturers(): Promise<Manufacturer[]> {
  const { data, error } = await supabase
    .from('manufacturers')
    .select('*')
    .order('name')

  if (error) throw error
  return (data || []) as Manufacturer[]
}

export async function searchProducts(query: string, limit = 10): Promise<Product[]> {
  if (!query.trim()) return []
  const sanitized = query.replace(/[,"]/g, ' ').replace(/%/g, '\\%').trim()
  if (!sanitized) return []

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .or(`name.ilike.%${sanitized}%,brand.ilike.%${sanitized}%,generic_name.ilike.%${sanitized}%`)
    .limit(limit)

  if (error) throw error
  return (data || []).map(mapProduct)
}

export async function createProduct(input: Omit<Product, 'id' | 'createdAt'> & { batchNumber?: string; expiryDate?: string }): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .insert({
      name: input.name,
      brand: input.brand,
      generic_name: input.genericName,
      manufacturer_id: input.manufacturerId,
      category_id: input.categoryId,
      description: input.description,
      price: input.price,
      original_price: input.originalPrice ?? null,
      discount_percent: input.discountPercent ?? 0,
      stock: 0,
      unit: input.unit,
      image_url: input.primaryImage ?? input.image ?? null,
      secondary_image_url: input.secondaryImage ?? null,
      is_active: input.isActive,
      is_featured: input.isFeatured ?? false,
    })
    .select('*')
    .single()
  if (error) throw error
  const product = mapProduct(data)
  if (input.stock > 0) {
    const batch = input.batchNumber?.trim() || `BATCH-${product.id.slice(0, 8).toUpperCase()}-001`
    const expiry = input.expiryDate ? new Date(input.expiryDate).toISOString().split('T')[0] : null
    const { error: invError } = await supabase.from('inventory_items').insert({
      product_id: product.id,
      batch_number: batch,
      quantity: input.stock,
      expiry_date: expiry,
    })
    if (invError) throw invError
  }
  return product
}

export async function updateProduct(productId: string, input: Partial<Omit<Product, 'id' | 'createdAt'>> & { batchNumber?: string; expiryDate?: string }): Promise<Product> {
  const payload: any = {}
  if (input.name !== undefined) payload.name = input.name
  if (input.brand !== undefined) payload.brand = input.brand
  if (input.genericName !== undefined) payload.generic_name = input.genericName
  if (input.manufacturerId !== undefined) payload.manufacturer_id = input.manufacturerId
  if (input.categoryId !== undefined) payload.category_id = input.categoryId
  if (input.description !== undefined) payload.description = input.description
  if (input.price !== undefined) payload.price = input.price
  if (input.originalPrice !== undefined) payload.original_price = input.originalPrice ?? null
  if (input.discountPercent !== undefined) payload.discount_percent = input.discountPercent ?? 0
  if (input.unit !== undefined) payload.unit = input.unit
  if (input.primaryImage !== undefined || input.image !== undefined) payload.image_url = input.primaryImage ?? input.image ?? null
  if (input.secondaryImage !== undefined) payload.secondary_image_url = input.secondaryImage ?? null
  if (input.isActive !== undefined) payload.is_active = input.isActive
  if (input.isFeatured !== undefined) payload.is_featured = input.isFeatured
  if (Object.keys(payload).length > 0) {
    const { error } = await supabase.from('products').update(payload).eq('id', productId)
    if (error) throw error
  }
  if (input.batchNumber || input.stock !== undefined) {
    const qty = input.stock ?? 0
    if (input.batchNumber) {
      const expiry = input.expiryDate ? new Date(input.expiryDate).toISOString().split('T')[0] : null
      const { data: existing } = await supabase.from('inventory_items').select('id, quantity').eq('product_id', productId).eq('batch_number', input.batchNumber).maybeSingle()
      if (existing) {
        const { error } = await supabase.from('inventory_items').update({ quantity: qty, expiry_date: expiry }).eq('id', existing.id)
        if (error) throw error
      } else if (qty >= 0) {
        const { error } = await supabase.from('inventory_items').insert({ product_id: productId, batch_number: input.batchNumber, quantity: qty, expiry_date: expiry })
        if (error) throw error
      }
    } else if (input.stock !== undefined) {
      const { data: batches } = await supabase.from('inventory_items').select('id').eq('product_id', productId).order('last_updated').limit(1)
      if (batches && batches.length > 0) {
        await supabase.from('inventory_items').update({ quantity: qty }).eq('id', batches[0].id)
      } else if (qty > 0) {
        await supabase.from('inventory_items').insert({ product_id: productId, batch_number: `BATCH-${productId.slice(0, 8).toUpperCase()}-001`, quantity: qty })
      }
    }
  }
  const { data, error } = await supabase.from('products').select('*, categories(name, slug), manufacturers(name)').eq('id', productId).single()
  if (error) throw error
  return mapProduct(data)
}

export async function fetchProductInventory(productId: string): Promise<Array<{ id: string; batchNumber: string; quantity: number; status: string; expiryDate?: string }>> {
  const { data, error } = await supabase.from('inventory_items').select('id, batch_number, quantity, status, expiry_date').eq('product_id', productId).order('expiry_date', { ascending: true })
  if (error) throw error
  return (data || []).map((row: any) => ({
    id: row.id,
    batchNumber: row.batch_number,
    quantity: row.quantity,
    status: row.status,
    expiryDate: row.expiry_date ?? undefined,
  }))
}