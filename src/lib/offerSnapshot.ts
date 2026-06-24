import type { Quote, Customer, Company, QuoteItem, Calculation, OfferSnapshot, OfferSnapshotItem } from '../types/database'

export function createSnapshot(data: any) {
  return data
}

export async function buildSnapshot(quote: Quote, customer: Customer | null, company: Company | null, items: QuoteItem[], calcs: Record<string, Calculation>): Promise<OfferSnapshot> {
  const snapshotItems: OfferSnapshotItem[] = items.map(item => {
    const calc = calcs[item.id]
    return {
      name: item.part_name,
      number: item.part_number,
      unit: 'kom',
      quantities: [{
        qty: item.quantity,
        unit_price: calc?.annual_value ?? 0,
        total: (calc?.annual_value ?? 0) * item.quantity,
        cost_per_piece: 0,
        margin: 0,
      }],
      internal: {
        total_material: 0,
        total_processes: 0,
        total_packaging: 0,
        total_overhead: 0,
        cost_per_piece: 0,
        selling_price: calc?.annual_value ?? 0,
      },
    }
  })

  return {
    offer: {
      number: quote.quote_number,
      issued_at: new Date().toISOString(),
      valid_until: quote.valid_until,
      lead_time: quote.lead_time,
      payment_terms: quote.payment_terms,
      parity: quote.parity,
      notes: quote.notes,
      currency: 'EUR',
    },
    customer: {
      name: customer?.name ?? 'Unknown',
      vat_number: customer?.vat_number ?? null,
      address: customer?.address ?? null,
      contact_person: quote.contact_person,
      contact_email: quote.contact_email,
      contact_phone: quote.contact_phone,
    },
    company: {
      name: company?.name ?? 'Company',
      address: null,
      tax_id: company?.tax_id ?? null,
      email: company?.email ?? null,
      phone: company?.phone ?? null,
      bank_name: null,
      bank_iban: null,
      logo_url: null,
    },
    items: snapshotItems,
    grand_total: Object.values(calcs).reduce((sum, calc) => sum + (calc.annual_value ?? 0), 0),
  }
}
