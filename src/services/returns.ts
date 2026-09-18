import { supabase } from '../lib/supabase'
import { mapReturnRequest } from '../lib/mappers'
import type { ReturnRequest } from '../types/return'

export async function fetchReturns(userId?: string): Promise<ReturnRequest[]> {
  let query = supabase.from('return_requests').select('*').order('created_at', { ascending: false })
  if (userId) query = query.eq('customer_id', userId)
  const { data, error } = await query
  if (error) throw error
  return (data || []).map(mapReturnRequest)
}

export async function fetchReturnById(returnId: string): Promise<ReturnRequest | null> {
  const { data, error } = await supabase.from('return_requests').select('*').eq('id', returnId).single()
  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return mapReturnRequest(data)
}

export async function createReturnRequest(input: {
  orderId: string
  customerId: string
  customerName: string
  productName: string
  quantity: number
  reason: string
}): Promise<ReturnRequest> {
  const { data, error } = await supabase
    .from('return_requests')
    .insert({
      order_id: input.orderId,
      customer_id: input.customerId,
      customer_name: input.customerName,
      product_name: input.productName,
      quantity: input.quantity,
      reason: input.reason,
      status: 'PENDING',
    })
    .select()
    .single()
  if (error) throw error
  return mapReturnRequest(data)
}

export async function updateReturnStatus(returnId: string, status: 'APPROVED' | 'REJECTED' | 'PROCESSED'): Promise<void> {
  const { error } = await supabase.from('return_requests').update({ status }).eq('id', returnId)
  if (error) throw error
}
