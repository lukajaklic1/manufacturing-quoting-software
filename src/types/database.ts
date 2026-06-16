export interface Company {
  id: string
  name: string
  currency: string
  // PO/legacy columns still present in DB (unused by QuotePro UI)
  po_prefix: string
  po_next_number: number
  address_street: string | null
  address_city: string | null
  address_postal_code: string | null
  address_country: string | null
  email: string | null
  phone: string | null
  tax_id: string | null
  logo_url: string | null
  bank_name: string | null
  bank_iban: string | null
  // QuotePro: overhead defaults + quote counter
  overhead_material_pct: number
  overhead_mfg_pct: number
  overhead_sga_pct: number
  overhead_logistics_pct: number
  overhead_rd_pct: number
  overhead_profit_pct: number
  quote_counter: number
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  company_id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  is_admin: boolean
  department_id: string | null
  job_title: string | null
  created_at: string
  updated_at: string
}

export interface UserPermission {
  id: string
  user_id: string
  module: 'requests' | 'purchase_orders' | 'receipts' | 'invoices' | 'budgets' | 'reports'
  can_view: boolean
  can_create: boolean
  can_approve: boolean
  can_pay: boolean
}

export interface InvitationPermission {
  module: UserPermission['module']
  can_view: boolean
  can_create: boolean
  can_approve: boolean
  can_pay: boolean
}

export interface UserInvitation {
  id: string
  company_id: string
  email: string
  token: string
  invited_by: string
  is_admin: boolean
  first_name: string | null
  last_name: string | null
  department_id: string | null
  job_title: string | null
  permissions: InvitationPermission[] | null
  status: 'pending' | 'accepted' | 'revoked'
  created_at: string
  accepted_at: string | null
}

// ─── QuotePro entities ──────────────────────────────────────

export interface Customer {
  id: string
  company_id: string
  name: string
  contact_person: string | null
  email: string | null
  phone: string | null
  address: string | null
  vat_number: string | null
  country: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type MachineCategory =
  | 'cnc_milling' | 'cnc_turning' | 'edm' | 'grinding' | 'laser'
  | 'pressing' | 'stamping' | 'bending' | 'welding'
  | 'injection' | 'extrusion' | 'coating' | 'heat_treatment'
  | 'assembly' | 'inspection' | 'other'

export interface EnergyMediaRow {
  name: string
  unit: string
  price_per_unit: number
  consumption_per_h: number
}

export interface Machine {
  id: string
  company_id: string
  name: string
  model: string | null
  category: MachineCategory | null
  energy_media: EnergyMediaRow[]
  // Capacity
  production_days_per_year: number
  shifts_per_day: number
  hours_per_shift: number
  break_min_per_shift: number
  utilization_pct: number
  // Investments
  acquisition_value: number | null
  installation_cost: number
  foundation_cost: number
  additional_cost: number
  residual_value: number
  depreciation_years: number | null
  interest_rate_pct: number | null
  insurance_rate_pct: number | null
  space_m2: number | null
  space_cost_per_m2: number | null
  // Variable
  maintenance_pct: number
  power_production_kw: number
  power_standby_kw: number
  electricity_cost_per_kwh: number
  water_cost_per_year: number
  compressed_air_cost_per_year: number
  tooling_cost_per_year: number
  consumables_cost_per_year: number
  other_variable_per_year: number
  // Rate
  hourly_rate_manual: number | null
  use_manual_rate: boolean
  hourly_rate_computed: number | null
  is_active: boolean
  notes: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
}

export interface LaborRate {
  id: string
  company_id: string
  name: string
  annual_cost: number
  working_days_per_year: number
  vacation_days: number
  shifts_per_day: number
  hours_per_shift: number
  break_min_per_shift: number
  utilization_pct: number
  hourly_rate_computed: number | null
  is_active: boolean
  notes: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
}

export interface Workstation {
  id: string
  company_id: string
  name: string
  hourly_rate: number
  is_active: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

export type QuoteStatus = 'draft' | 'sent' | 'won' | 'lost' | 'frozen'
export type LostReason = 'price' | 'time' | 'quality' | 'competitor' | 'other'

export interface Quote {
  id: string
  company_id: string
  customer_id: string
  quote_number: string
  title: string
  status: QuoteStatus
  lost_reason: LostReason | null
  valid_until: string | null
  delivery_date: string | null
  notes: string | null
  created_by: string
  sent_at: string | null
  created_at: string
  updated_at: string
}

export interface QuoteItem {
  id: string
  quote_id: string
  company_id: string
  position: number
  part_name: string
  part_number: string | null
  quantity: number
  notes: string | null
  created_at: string
}

// JSONB section row shapes (calculations.*)
export interface RawMaterialRow {
  name: string
  unit: string
  qty_per_piece: number
  price_per_unit: number
  scrap_pct: number
  total: number
}
export interface PurchasedPartRow {
  name: string
  supplier: string
  unit: string
  qty_per_piece: number
  price_per_unit: number
  total: number
}
export interface ProcessRow {
  ref_type: 'machine' | 'workstation'
  ref_id: string | null
  name: string
  hourly_rate: number
  setup_min: number
  cycle_min: number
  total: number
}
export interface ToolingRow {
  name: string
  tool_cost: number
  lifetime_pcs: number
  cost_per_piece: number
}
export interface InvestmentRow {
  name: string
  value: number
  utilization_pct: number
  project_years: number
  lifetime_pcs: number
  interest_rate_pct: number
  insurance_rate_pct: number
  additional_cost: number
  amortization_per_piece: number
  interest_per_piece: number
  insurance_per_piece: number
  total_per_piece: number
}
export interface PackagingRow {
  name: string
  qty_per_piece: number
  price_per_unit: number
  total: number
}

export interface Calculation {
  id: string
  quote_item_id: string
  company_id: string
  version: number
  raw_materials: RawMaterialRow[]
  purchased_parts: PurchasedPartRow[]
  processes: ProcessRow[]
  tooling: ToolingRow[]
  investments: InvestmentRow[]
  packaging: PackagingRow[]
  oh_material_pct: number
  oh_mfg_pct: number
  oh_sga_pct: number
  oh_logistics_pct: number
  oh_rd_pct: number
  profit_pct: number
  total_raw_materials: number
  total_purchased_parts: number
  total_processes: number
  total_tooling: number
  total_investments: number
  total_packaging: number
  total_overhead: number
  cost_per_piece: number
  selling_price: number
  annual_value: number
  created_at: string
  updated_at: string
}

export interface QuoteAttachment {
  id: string
  company_id: string
  quote_id: string
  file_name: string
  storage_path: string
  file_size: number | null
  uploaded_by: string | null
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      companies: { Row: Company; Insert: Omit<Company, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<Company, 'id'>> }
      users: { Row: User; Insert: Omit<User, 'created_at' | 'updated_at'>; Update: Partial<Omit<User, 'id'>> }
      user_permissions: { Row: UserPermission; Insert: Omit<UserPermission, 'id'>; Update: Partial<Omit<UserPermission, 'id'>> }
      user_invitations: { Row: UserInvitation; Insert: Omit<UserInvitation, 'id' | 'created_at'>; Update: Partial<Omit<UserInvitation, 'id'>> }
      customers: { Row: Customer; Insert: Omit<Customer, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<Customer, 'id'>> }
      machines: { Row: Machine; Insert: Omit<Machine, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<Machine, 'id'>> }
      workstations: { Row: Workstation; Insert: Omit<Workstation, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<Workstation, 'id'>> }
      labor_rates: { Row: LaborRate; Insert: Omit<LaborRate, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<LaborRate, 'id'>> }
      quotes: { Row: Quote; Insert: Omit<Quote, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<Quote, 'id'>> }
      quote_items: { Row: QuoteItem; Insert: Omit<QuoteItem, 'id' | 'created_at'>; Update: Partial<Omit<QuoteItem, 'id'>> }
      calculations: { Row: Calculation; Insert: Omit<Calculation, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<Calculation, 'id'>> }
      quote_attachments: { Row: QuoteAttachment; Insert: Omit<QuoteAttachment, 'id' | 'created_at'>; Update: Partial<Omit<QuoteAttachment, 'id'>> }
    }
  }
}
