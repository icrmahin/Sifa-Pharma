import { supabase } from '../lib/supabase'

export interface CustomerRecord {
  id: string
  name: string
  email?: string
  phone?: string
  role: string
  orderCount: number
  totalSpent: number
  createdAt: string
}

export async function fetchCustomers(query?: string): Promise<CustomerRecord[]> {
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, name, email, phone, role, created_at')
    .eq('role', 'customer')
    .order('created_at', { ascending: false })
    .limit(100)
  if (error) throw error

  const { data: orders } = await supabase.from('orders').select('customer_id, total')

  const stats = new Map<string, { count: number; total: number }>()
  for (const o of (orders || []) as any[]) {
    const s = stats.get(o.customer_id) || { count: 0, total: 0 }
    s.count += 1
    s.total += Number(o.total || 0)
    stats.set(o.customer_id, s)
  }

  let list: CustomerRecord[] = (profiles || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    email: p.email ?? undefined,
    phone: p.phone ?? undefined,
    role: p.role,
    orderCount: stats.get(p.id)?.count ?? 0,
    totalSpent: stats.get(p.id)?.total ?? 0,
    createdAt: p.created_at,
  }))

  if (query?.trim()) {
    const q = query.trim().toLowerCase()
    list = list.filter((c) => c.name.toLowerCase().includes(q) || (c.email || '').toLowerCase().includes(q) || (c.phone || '').includes(q))
  }

  return list
}

export async function fetchCustomerById(customerId: string): Promise<CustomerRecord | null> {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, name, email, phone, role, created_at')
    .eq('id', customerId)
    .single()
  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  const { data: orders } = await supabase.from('orders').select('total').eq('customer_id', customerId)
  const orderCount = (orders || []).length
  const totalSpent = (orders || []).reduce((sum: number, o: any) => sum + Number(o.total || 0), 0)
  return {
    id: profile.id,
    name: profile.name,
    email: profile.email ?? undefined,
    phone: profile.phone ?? undefined,
    role: profile.role,
    orderCount,
    totalSpent,
    createdAt: profile.created_at,
  }
}
