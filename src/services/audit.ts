import { supabase } from '../lib/supabase'
import { mapAuditEntry } from '../lib/mappers'
import type { AuditEntry } from '../types/audit'

export async function fetchAuditEntries(limit = 50): Promise<AuditEntry[]> {
  const { data, error } = await supabase
    .from('audit_entries')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data || []).map(mapAuditEntry)
}
