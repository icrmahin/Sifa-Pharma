import { supabase } from '../lib/supabase'
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
    queryBuilder = queryBuilder.or(`name.ilike.%${query}%,brand.ilike.%${query}%,generic_name.ilike.%${query}%`)
  }

  const { data, error, count } = await queryBuilder

  if (error) throw error

  return {
    data: (data || []) as Product[],
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

  return data as Product
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

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .or(`name.ilike.%${query}%,brand.ilike.%${query}%,generic_name.ilike.%${query}%`)
    .limit(limit)

  if (error) throw error
  return (data || []) as Product[]
}