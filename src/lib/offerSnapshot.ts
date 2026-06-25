import type { Quote, Customer, Company, QuoteItem, Calculation, OfferSnapshot, OfferSnapshotItem } from '../types/database'
import { computeTotals } from '../hooks/useCalculator'

export function createSnapshot(data: any) {
  return data
}

function composeAddress(c: Company | null): string | null {
  if (!c) return null
  const line1 = c.address_street?.trim()
  const cityLine = [c.address_postal_code, c.address_city].filter(Boolean).join(' ').trim()
  const parts = [line1, cityLine, c.address_country?.trim()].filter(Boolean)
  return parts.length ? parts.join(', ') : null
}

export async function buildSnapshot(quote: Quote, customer: Customer | null, company: Company | null, items: QuoteItem[], calcs: Record<string, Calculation>, itemThumbs: Record<string, string> = {}): Promise<OfferSnapshot> {
  const snapshotItems: OfferSnapshotItem[] = items.map(item => {
    const calc = calcs[item.id]

    // Quantity breaks: each gets its own recomputed price (setup/packaging amortize differently per qty).
    const qtyBreaks = (Array.isArray(calc?.quantities) && calc!.quantities.length
      ? calc!.quantities
      : [item.quantity]
    ).filter(q => q > 0)

    const quantities = qtyBreaks.map(qty => {
      const t = calc ? computeTotals(calc, qty) : null
      const unit_price = t?.selling_price ?? 0
      return {
        qty,
        unit_price,
        total: Math.round(unit_price * qty * 100) / 100,
        cost_per_piece: t?.cost_per_piece ?? 0,
        margin: calc?.profit_pct ?? 0,
      }
    })

    const primary = calc ? computeTotals(calc, qtyBreaks[0] ?? 0) : null

    return {
      name: item.part_name,
      number: item.part_number,
      unit: 'kom',
      thumb: itemThumbs[item.id] ?? null,
      quantities: quantities.length ? quantities : [{ qty: item.quantity, unit_price: 0, total: 0, cost_per_piece: 0, margin: 0 }],
      internal: {
        total_material: primary ? primary.total_raw_materials + primary.total_purchased_parts : 0,
        total_processes: primary?.total_processes ?? 0,
        total_packaging: primary?.total_packaging ?? 0,
        total_overhead: primary?.total_overhead ?? 0,
        cost_per_piece: primary?.cost_per_piece ?? 0,
        selling_price: primary?.selling_price ?? 0,
      },
    }
  })

  // Grand total = sum of each item's primary (first) quantity-break total.
  const grand_total = Math.round(
    snapshotItems.reduce((sum, it) => sum + (it.quantities[0]?.total ?? 0), 0) * 100
  ) / 100

  return {
    offer: {
      number: quote.quote_number,
      issued_at: new Date().toISOString(),
      valid_until: quote.valid_until,
      lead_time: quote.lead_time,
      payment_terms: quote.payment_terms,
      parity: quote.parity,
      notes: quote.notes,
      currency: company?.currency || 'EUR',
    },
    customer: {
      name: customer?.name ?? 'Unknown',
      vat_number: customer?.vat_number ?? null,
      address: customer?.address ?? composeAddress(null),
      contact_person: quote.contact_person,
      contact_email: quote.contact_email,
      contact_phone: quote.contact_phone,
    },
    company: {
      name: company?.name ?? 'Company',
      address: composeAddress(company),
      tax_id: company?.tax_id ?? null,
      email: company?.email ?? null,
      phone: company?.phone ?? null,
      bank_name: company?.bank_name ?? null,
      bank_iban: company?.bank_iban ?? null,
      logo_url: company?.logo_url ?? null,
    },
    items: snapshotItems,
    grand_total,
  }
}
