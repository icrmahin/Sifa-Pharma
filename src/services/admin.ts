import { supabase } from '../lib/supabase'
import { mapOrder, mapProduct } from '../lib/mappers'
import type { Product } from '../types/product'
import type { Order } from '../types/order'

interface SupabaseResponse<T> {
  data: T | null
  error: any
  count: number | null
}

interface InventoryItemWithProduct {
  id: string
  product_id: string
  batch_number: string
  quantity: number
  status: string
  expiry_date: string | null
  products: { name: string }[]
}

interface OrderBasic {
  id: string
  order_number: string
  customer_name: string
  total: number
}

interface OrderWithStatus {
  id: string
  order_number: string
  customer_name: string
  total: number
  status: string
  created_at: string
}

interface AuditEntry {
  id: string
  action: string
  actor: string
  record_type: string
  timestamp: string
}

export interface AdminDashboardData {
  pendingOrders: number
  processingOrders: number
  activeProducts: number
  lowStockProducts: number
  attentionOrders: { id: string; orderNumber: string; customerName: string; total: number }[]
  pendingReturns: { id: string; productName: string; customerName: string; quantity: number }[]
  lowStockBatches: { id: string; productName: string; batchNumber: string; quantity: number; status: 'healthy' | 'low' | 'out_of_stock'; expiryDate?: string }[]
  expiringBatches: { id: string; productName: string; batchNumber: string; quantity: number; status: 'healthy' | 'low' | 'out_of_stock'; expiryDate?: string }[]
  recentOrders: { id: string; orderNumber: string; customerName: string; total: number; status: string; createdAt: string }[]
  recentActivity: { id: string; action: string; actor: string; recordType: string; timestamp: string }[]
}

export async function fetchAdminDashboard(): Promise<AdminDashboardData> {
  const [
    pendingResult,
    processingResult,
    activeResult,
    lowStockCountResult,
    attentionResult,
    lowStockItemsResult,
    expiringResult,
    recentOrdersResult,
    recentActivityResult,
  ] = await Promise.all([
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'PENDING'),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'PROCESSING'),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true).lt('stock', 10),
    supabase
      .from('orders')
      .select('id, order_number, customer_name, total')
      .eq('status', 'PENDING')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('inventory_items')
      .select('id, product_id, batch_number, quantity, status, expiry_date, products(name)')
      .lt('quantity', 10)
      .order('quantity', { ascending: true })
      .limit(10),
    supabase
      .from('inventory_items')
      .select('id, product_id, batch_number, quantity, status, expiry_date, products(name)')
      .not('expiry_date', 'is', null)
      .lt('expiry_date', new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('expiry_date', { ascending: true })
      .limit(10),
    supabase
      .from('orders')
      .select('id, order_number, customer_name, total, status, created_at')
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('audit_entries')
      .select('id, action, actor, record_type, timestamp')
      .order('timestamp', { ascending: false })
      .limit(10),
  ])

  const pendingOrders = pendingResult.count || 0
  const processingOrders = processingResult.count || 0
  const activeProducts = activeResult.count || 0
  const lowStockProducts = lowStockCountResult.count || 0

  const attentionOrders = (attentionResult.data as OrderBasic[] || []).map(order => ({
    id: order.id,
    orderNumber: order.order_number,
    customerName: order.customer_name,
    total: order.total,
  }))

  const transformedLowStock = (lowStockItemsResult.data as InventoryItemWithProduct[] || []).map(item => ({
    id: item.id,
    productName: item.products?.[0]?.name || 'Unknown',
    batchNumber: item.batch_number,
    quantity: item.quantity,
    status: item.status as 'healthy' | 'low' | 'out_of_stock',
    expiryDate: item.expiry_date || undefined,
  }))

  const transformedExpiring = (expiringResult.data as InventoryItemWithProduct[] || []).map(item => ({
    id: item.id,
    productName: item.products?.[0]?.name || 'Unknown',
    batchNumber: item.batch_number,
    quantity: item.quantity,
    status: item.status as 'healthy' | 'low' | 'out_of_stock',
    expiryDate: item.expiry_date || undefined,
  }))

  const transformedRecentOrders = (recentOrdersResult.data as OrderWithStatus[] || []).map(order => ({
    id: order.id,
    orderNumber: order.order_number,
    customerName: order.customer_name,
    total: order.total,
    status: order.status,
    createdAt: order.created_at,
  }))

  const transformedActivity = (recentActivityResult.data as AuditEntry[] || []).map(activity => ({
    id: activity.id,
    action: activity.action,
    actor: activity.actor,
    recordType: activity.record_type,
    timestamp: activity.timestamp,
  }))

  return {
    pendingOrders,
    processingOrders,
    activeProducts,
    lowStockProducts,
    attentionOrders,
    pendingReturns: [],
    lowStockBatches: transformedLowStock,
    expiringBatches: transformedExpiring,
    recentOrders: transformedRecentOrders,
    recentActivity: transformedActivity,
  }
}

export async function fetchAdminProducts(filters?: { status?: string; stockFilter?: string; categoryId?: string; query?: string; limit?: number; offset?: number }): Promise<{ data: Product[]; total: number }> {
  let query = supabase
    .from('products')
    .select('*, categories(name, slug), manufacturers(name)', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (filters?.status === 'active') query = query.eq('is_active', true)
  if (filters?.status === 'inactive') query = query.eq('is_active', false)
  if (filters?.stockFilter === 'low') query = query.lt('stock', 10)
  if (filters?.stockFilter === 'out') query = query.eq('stock', 0)
  if (filters?.categoryId) query = query.eq('category_id', filters.categoryId)
  if (filters?.query) {
    query = query.or(`name.ilike.%${filters.query}%,brand.ilike.%${filters.query}%,generic_name.ilike.%${filters.query}%`)
  }
  if (filters?.limit) query = query.limit(filters.limit)
  if (filters?.offset) query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1)

  const { data, error, count } = await query
  if (error) throw error

  return { data: (data || []).map(mapProduct), total: count || 0 }
}

export async function fetchAdminOrders(filters?: { status?: string; limit?: number; offset?: number }): Promise<{ data: Order[]; total: number }> {
  let query = supabase
    .from('orders')
    .select('*, order_items(*)', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (filters?.status) query = query.eq('status', filters.status)
  if (filters?.limit) query = query.limit(filters.limit)
  if (filters?.offset) query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1)

  const { data, error, count } = await query
  if (error) throw error

  return { data: (data || []).map((row: any) => mapOrder(row)), total: count || 0 }
}

export async function fetchAdminOrderById(orderId: string): Promise<Order | null> {
  const { data, error } = await supabase.from('orders').select('*, order_items(*)').eq('id', orderId).single()
  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return mapOrder(data)
}

export async function updateOrderStatus(orderId: string, status: string): Promise<void> {
  const { error } = await supabase.rpc('transition_order_status', {
    p_order_id: orderId,
    p_new_status: status,
    p_admin_id: (await supabase.auth.getUser()).data.user?.id,
  })
  if (error) throw error
}

export async function fetchAdminInventory(): Promise<any[]> {
  const { data, error } = await supabase
    .from('inventory_items')
    .select('*, products(name, brand, generic_name, is_active)')
    .order('last_updated', { ascending: false })

  if (error) throw error
  return data || []
}

export async function createStockAdjustment(adjustment: {
  product_id: string
  batch_number: string
  type: 'increase' | 'decrease'
  quantity: number
  reason: string
  admin_id: string
}): Promise<void> {
  const { error } = await supabase
    .from('stock_adjustments')
    .insert(adjustment)
  if (error) throw error
}