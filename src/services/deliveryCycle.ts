import { supabase } from '../lib/supabase'
import type { DeliveryCycle, DeliveryCycleWithProducts } from '../types/deliveryCycle'

export async function fetchActiveDeliveryCycle(userId: string): Promise<DeliveryCycleWithProducts | null> {
  const { data, error } = await supabase
    .from('delivery_cycles')
    .select('*')
    .eq('customer_id', userId)
    .eq('status', 'PENDING')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data as DeliveryCycleWithProducts
}

export async function fetchDeliveryCycleById(cycleId: string): Promise<DeliveryCycleWithProducts | null> {
  const { data, error } = await supabase
    .from('delivery_cycles')
    .select('*')
    .eq('id', cycleId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data as DeliveryCycleWithProducts
}

export async function createDeliveryCycle(userId: string): Promise<DeliveryCycleWithProducts> {
  const now = new Date()
  const closesAt = new Date(now.getTime() + 24 * 60 * 60 * 1000)

  const { data, error } = await supabase
    .from('delivery_cycles')
    .insert({
      customer_id: userId,
      status: 'PENDING',
      started_at: now.toISOString(),
      closes_at: closesAt.toISOString(),
      estimated_total: 0,
    })
    .select()
    .single()

  if (error) throw error
  return data as DeliveryCycleWithProducts
}

export async function updateDeliveryCycleStatus(cycleId: string, status: string): Promise<void> {
  const { error } = await supabase
    .from('delivery_cycles')
    .update({ status })
    .eq('id', cycleId)
  if (error) throw error
}