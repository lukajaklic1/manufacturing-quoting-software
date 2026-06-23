import { supabase } from './supabase'

// Sets of ids that are referenced somewhere, so the UI can hide delete and block deletion.
// References live inside calculations JSONB (processes / raw_materials), so we read and scan in JS.

async function allCalcs(): Promise<{ processes?: any[]; raw_materials?: any[] }[]> {
  const { data } = await supabase.from('calculations').select('processes, raw_materials')
  return (data as any[]) ?? []
}

export async function usedMachineIds(): Promise<Set<string>> {
  const set = new Set<string>()
  for (const c of await allCalcs()) for (const p of c.processes ?? []) {
    if (p?.machine_id) set.add(p.machine_id)
    if (p?.ref_id && p?.ref_type === 'machine') set.add(p.ref_id) // legacy
  }
  return set
}

export async function usedLaborIds(): Promise<Set<string>> {
  const set = new Set<string>()
  for (const c of await allCalcs()) for (const p of c.processes ?? []) {
    if (p?.operator_id) set.add(p.operator_id)
    if (p?.setup_id) set.add(p.setup_id)
  }
  return set
}

export async function usedMaterialIds(): Promise<Set<string>> {
  const set = new Set<string>()
  for (const c of await allCalcs()) for (const r of c.raw_materials ?? []) {
    if (r?.material_id) set.add(r.material_id)
  }
  return set
}

export async function usedCustomerIds(): Promise<Set<string>> {
  const { data } = await supabase.from('quotes').select('customer_id')
  const set = new Set<string>()
  for (const q of (data as { customer_id: string | null }[]) ?? []) if (q.customer_id) set.add(q.customer_id)
  return set
}
