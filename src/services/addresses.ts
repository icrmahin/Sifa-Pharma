import { supabase } from '../lib/supabase'
import type { Address } from '../types/address'

export async function fetchAddresses(userId: string): Promise<Address[]> {
  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []) as Address[]
}

export async function fetchAddressById(addressId: string): Promise<Address | null> {
  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('id', addressId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data as Address
}

export async function createAddress(userId: string, address: Omit<Address, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Address> {
  const { data, error } = await supabase
    .from('addresses')
    .insert({ ...address, user_id: userId })
    .select()
    .single()

  if (error) throw error
  return data as Address
}

export async function updateAddress(addressId: string, userId: string, updates: Partial<Omit<Address, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<Address> {
  const { data, error } = await supabase
    .from('addresses')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', addressId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error
  return data as Address
}

export async function deleteAddress(addressId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('addresses')
    .delete()
    .eq('id', addressId)
    .eq('user_id', userId)
  if (error) throw error
}

export async function setDefaultAddress(userId: string, addressId: string): Promise<void> {
  // First, unset any existing default
  await supabase
    .from('addresses')
    .update({ is_default: false })
    .eq('user_id', userId)
    .eq('is_default', true)

  // Then set the new default
  const { error } = await supabase
    .from('addresses')
    .update({ is_default: true, updated_at: new Date().toISOString() })
    .eq('id', addressId)
    .eq('user_id', userId)
  if (error) throw error
}