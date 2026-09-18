import { supabase } from '../lib/supabase'
import { mapOrder } from '../lib/mappers'
import type { Order, OrderItem } from '../types/order'

export interface OrderWithItems extends Order {
  items: OrderItem[]
}

export async function fetchOrders(options?: { limit?: number; offset?: number }): Promise<Order[]> {
  let query = supabase
    .from('orders')
    .select('*, order_items(*)', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (options?.limit) query = query.limit(options.limit)
  if (options?.offset !== undefined && options?.limit) query = query.range(options.offset, options.offset + options.limit - 1)

  const { data, error } = await query

  if (error) throw error
  return (data || []).map((row: any) => mapOrder(row))
}

export async function fetchOrderById(orderId: string): Promise<OrderWithItems | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', orderId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return mapOrder(data) as OrderWithItems
}

export async function createOrder(customerId: string, addressId: string): Promise<string> {
  const { data, error } = await supabase.rpc('create_order', {
    p_customer_id: customerId,
    p_address_id: addressId,
  })

  if (error) throw error
  return data as string
}

export async function fetchOrderTimeline(orderId: string): Promise<{ label: string; time: string; note?: string }[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('timeline')
    .eq('id', orderId)
    .single()

  if (error) throw error
  return (data?.timeline as { label: string; time: string; note?: string }[]) || []
}