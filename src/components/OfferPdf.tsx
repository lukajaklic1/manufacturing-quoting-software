import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer'
import type { OfferSnapshot } from '../types/database'
import FontRegular from '../assets/Arial.ttf?url'
import FontBold from '../assets/Arial-Bold.ttf?url'

Font.register({
  family: 'Roboto',
  fonts: [
    { src: FontRegular, fontWeight: 400 },
    { src: FontBold, fontWeight: 700 },
  ],
})

const c = {
  primary: '#111827',
  text: '#111827',
  muted: '#6b7280',
  border: '#d1d5db',
  bg: '#f3f4f6',
  white: '#ffffff',
}

const s = StyleSheet.create({
  page: { fontFamily: 'Roboto', fontSize: 9, color: c.text, paddingHorizontal: 40, paddingTop: 36, paddingBottom: 52, backgroundColor: c.white },

  // ── Header ────────────────────────────────────────────────────
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, borderBottomWidth: 1, borderBottomColor: c.border, paddingBottom: 16 },
  companyBlock: { flex: 1 },
  companyName: { fontSize: 15, fontWeight: 700, color: c.primary, marginBottom: 4 },
  companyDetail: { fontSize: 8, color: c.muted, lineHeight: 1.5 },
  titleBlock: { alignItems: 'flex-end' },
  titleLabel: { fontSize: 24, fontWeight: 700, color: c.primary, marginBottom: 4 },
  titleNumber: { fontSize: 11, fontWeight: 700, color: c.text, marginBottom: 2 },
  titleDate: { fontSize: 8, color: c.muted },

  // ── Customer row ───────────────────────────────────────────────
  customerRow: { marginBottom: 18 },
  customerLabel: { fontSize: 7, color: c.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  customerName: { fontSize: 11, fontWeight: 700, marginBottom: 3 },
  customerDetail: { fontSize: 8.5, color: c.muted, lineHeight: 1.5 },

  // ── Terms strip ────────────────────────────────────────────────
  termsRow: { flexDirection: 'row', backgroundColor: c.bg, borderRadius: 4, paddingVertical: 8, paddingHorizontal: 10, marginBottom: 20, borderWidth: 1, borderColor: c.border },
  termItem: { flex: 1, alignItems: 'center' },
  termLabel: { fontSize: 7, color: c.muted, marginBottom: 2 },
  termValue: { fontSize: 9, color: c.text, fontWeight: 700 },
  termDivider: { width: 1, backgroundColor: c.border, marginVertical: 2 },

  // ── Table ──────────────────────────────────────────────────────
  tableHeader: { flexDirection: 'row', backgroundColor: c.bg, paddingVertical: 6, paddingHorizontal: 8, borderBottomWidth: 2, borderBottomColor: c.primary },
  thText: { fontSize: 7.5, fontWeight: 700, color: c.muted },
  colPos: { width: 24 },
  colThumb: { width: 52 },
  colName: { flex: 1, paddingRight: 6 },
  colQty: { width: 40 },
  colUnit: { width: 28 },
  colPrice: { width: 64 },
  colTotal: { width: 68 },

  itemRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: c.border, paddingVertical: 8, paddingHorizontal: 8 },
  tableRowAlt: { backgroundColor: '#fafafa' },
  posText: { fontSize: 9, fontWeight: 700, color: c.primary },
  itemName: { fontSize: 9, fontWeight: 700, marginBottom: 2 },
  itemNumber: { fontSize: 7.5, color: c.muted },
  thumbImg: { width: 44, height: 36, objectFit: 'contain', borderRadius: 3 },
  thumbPlaceholder: { width: 44, height: 36, backgroundColor: c.bg, borderRadius: 3 },
  qtyTable: { width: 40 + 28 + 64 + 68 },
  qtyLine: { flexDirection: 'row', paddingVertical: 2 },
  qtyLineBorder: { borderTopWidth: 1, borderTopColor: '#eef0f2' },

  // ── Total ──────────────────────────────────────────────────────
  totalSection: { marginTop: 12, alignItems: 'flex-end' },
  grandTotalBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: c.bg, borderRadius: 4, paddingVertical: 10, paddingHorizontal: 16, width: 260, borderWidth: 1, borderColor: c.border },
  grandTotalLabel: { fontSize: 10, fontWeight: 700, color: c.text },
  grandTotalValue: { fontSize: 13, fontWeight: 700, color: c.text },

  // ── Notes ─────────────────────────────────────────────────────
  notesBox: { marginTop: 20, backgroundColor: c.bg, borderRadius: 4, padding: 10 },
  notesLabel: { fontSize: 7, color: c.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  notesText: { fontSize: 8.5, lineHeight: 1.6 },

  // ── Terms ──────────────────────────────────────────────────────
  termsBox: { marginTop: 16, borderTopWidth: 1, borderTopColor: c.border, paddingTop: 10 },
  termsLabel: { fontSize: 7, color: c.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  termsText: { fontSize: 7.5, color: c.muted, lineHeight: 1.5 },

  // ── Footer (every page) ────────────────────────────────────────
  footer: { position: 'absolute', bottom: 16, left: 40, right: 40, borderTopWidth: 1, borderTopColor: c.border, paddingTop: 6 },
  footerTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  footerMain: { fontSize: 7, color: c.muted },
  footerPage: { fontSize: 7, color: c.muted },
  footerBank: { fontSize: 7, color: c.muted },
})

function fmtNum(n: number, decimals = 2) {
  const parts = n.toFixed(decimals).split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return decimals > 0 ? parts[0] + ',' + parts[1] : parts[0]
}

function eur(n: number) {
  return fmtNum(n, 2) + ' €'
}

function fmtQty(n: number) {
  return fmtNum(n, 0)
}

function fmtDate(d: string | null | undefined) {
  if (!d) return '—'
  try { return new Date(d).toLocaleDateString('sl-SI') } catch { return String(d) }
}

const PDF_LABELS = {
  sl: {
    title: 'PONUDBA',
    date: 'Datum',
    customer: 'Kupec',
    vatId: 'ID DDV',
    vatIdComp: 'ID za DDV',
    validity: 'Veljavnost',
    leadTime: 'Rok dobave',
    paymentTerms: 'Plačilni pogoji',
    parity: 'Paritetni pogoji',
    currency: 'Valuta',
    partName: 'Naziv kosa',
    qty: 'Kol.',
    unit: 'Enota',
    pricePerPc: 'Cena/kos',
    total: 'Skupaj',
    grandTotal: 'SKUPAJ BREZ DDV',
    notes: 'Opombe',
    terms: 'Splošni pogoji poslovanja',
    page: (n: number, t: number) => `Stran ${n} / ${t}`,
  },
  en: {
    title: 'QUOTATION',
    date: 'Date',
    customer: 'Customer',
    vatId: 'VAT ID',
    vatIdComp: 'VAT ID',
    validity: 'Valid until',
    leadTime: 'Lead time',
    paymentTerms: 'Payment terms',
    parity: 'Parity (Incoterm)',
    currency: 'Currency',
    partName: 'Part name',
    qty: 'Qty',
    unit: 'Unit',
    pricePerPc: 'Price/pc',
    total: 'Total',
    grandTotal: 'TOTAL EX. VAT',
    notes: 'Notes',
    terms: 'General terms and conditions',
    page: (n: number, t: number) => `Page ${n} / ${t}`,
  },
}

export default function OfferPdf({ snap, lang = 'sl' }: { snap: OfferSnapshot; lang?: 'sl' | 'en' }) {
  if (!snap) return <Document><Page><Text>No data</Text></Page></Document>

  const { offer, company, customer, items, grand_total } = snap
  const L = PDF_LABELS[lang]

  const bankLine = [
    company.bank_iban && `IBAN: ${company.bank_iban}`,
    company.bank_name && company.bank_name,
  ].filter(Boolean).join(' · ')

  const footerLeft = [
    company.name,
    company.tax_id && `${L.vatId}: ${company.tax_id}`,
  ].filter(Boolean).join(' · ')

  return (
    <Document>
      <Page size="A4" style={s.page}>

        {/* Header — company ONCE on left, title on right */}
        <View style={s.headerRow}>
          <View style={s.companyBlock}>
            <Text style={s.companyName}>{company.name}</Text>
            {company.address && <Text style={s.companyDetail}>{company.address}</Text>}
            {company.phone && <Text style={s.companyDetail}>{company.phone}</Text>}
            {company.email && <Text style={s.companyDetail}>{company.email}</Text>}
            {company.tax_id && <Text style={s.companyDetail}>{L.vatIdComp}: {company.tax_id}</Text>}
          </View>
          <View style={s.titleBlock}>
            <Text style={s.titleLabel}>{L.title}</Text>
            <Text style={s.titleNumber}>{offer.number}</Text>
            <Text style={s.titleDate}>{L.date}: {fmtDate(offer.issued_at)}</Text>
          </View>
        </View>

        {/* Customer */}
        <View style={s.customerRow}>
          <Text style={s.customerLabel}>{L.customer}</Text>
          <Text style={s.customerName}>{customer.name}</Text>
          {customer.address && <Text style={s.customerDetail}>{customer.address}</Text>}
          {customer.vat_number && <Text style={s.customerDetail}>{L.vatId}: {customer.vat_number}</Text>}
          {customer.contact_person && <Text style={s.customerDetail}>{customer.contact_person}</Text>}
          {customer.contact_email && <Text style={s.customerDetail}>{customer.contact_email}</Text>}
          {customer.contact_phone && <Text style={s.customerDetail}>{customer.contact_phone}</Text>}
        </View>

        {/* Terms strip */}
        <View style={s.termsRow}>
          <View style={s.termItem}>
            <Text style={s.termLabel}>{L.validity}</Text>
            <Text style={s.termValue}>{fmtDate(offer.valid_until)}</Text>
          </View>
          <View style={s.termDivider} />
          <View style={s.termItem}>
            <Text style={s.termLabel}>{L.leadTime}</Text>
            <Text style={s.termValue}>{offer.lead_time || '—'}</Text>
          </View>
          <View style={s.termDivider} />
          <View style={s.termItem}>
            <Text style={s.termLabel}>{L.paymentTerms}</Text>
            <Text style={s.termValue}>{offer.payment_terms || '—'}</Text>
          </View>
          <View style={s.termDivider} />
          <View style={s.termItem}>
            <Text style={s.termLabel}>{L.parity}</Text>
            <Text style={s.termValue}>{offer.parity || '—'}</Text>
          </View>
          <View style={s.termDivider} />
          <View style={s.termItem}>
            <Text style={s.termLabel}>{L.currency}</Text>
            <Text style={s.termValue}>{offer.currency}</Text>
          </View>
        </View>

        {/* Table */}
        <View style={s.tableHeader}>
          <View style={s.colPos}><Text style={s.thText}>{lang === 'sl' ? 'Poz.' : 'Pos.'}</Text></View>
          <View style={s.colThumb} />
          <View style={s.colName}><Text style={s.thText}>{L.partName}</Text></View>
          <View style={s.colQty}><Text style={[s.thText, { textAlign: 'right' }]}>{L.qty}</Text></View>
          <View style={s.colUnit}><Text style={[s.thText, { textAlign: 'center' }]}>{L.unit}</Text></View>
          <View style={s.colPrice}><Text style={[s.thText, { textAlign: 'right' }]}>{L.pricePerPc}</Text></View>
          <View style={s.colTotal}><Text style={[s.thText, { textAlign: 'right' }]}>{L.total}</Text></View>
        </View>

        {items.map((item, idx) => (
          <View key={idx} style={[s.itemRow, idx % 2 === 1 ? s.tableRowAlt : {}]} wrap={false}>
            <View style={s.colPos}><Text style={s.posText}>{idx + 1}</Text></View>
            <View style={s.colThumb}>
              {item.thumb ? <Image style={s.thumbImg} src={item.thumb} /> : <View style={s.thumbPlaceholder} />}
            </View>
            <View style={s.colName}>
              <Text style={s.itemName}>{item.name}</Text>
              {item.number && <Text style={s.itemNumber}>{item.number}</Text>}
            </View>
            <View style={s.qtyTable}>
              {item.quantities.map((q, qi) => (
                <View key={qi} style={[s.qtyLine, qi > 0 ? s.qtyLineBorder : {}]}>
                  <View style={s.colQty}><Text style={{ fontSize: 9, fontWeight: 700, textAlign: 'right' }}>{fmtQty(q.qty)}</Text></View>
                  <View style={s.colUnit}><Text style={{ fontSize: 9, textAlign: 'center', color: c.muted }}>{item.unit}</Text></View>
                  <View style={s.colPrice}><Text style={{ fontSize: 9, textAlign: 'right' }}>{eur(q.unit_price)}</Text></View>
                  <View style={s.colTotal}><Text style={{ fontSize: 9, fontWeight: 700, textAlign: 'right' }}>{eur(q.total)}</Text></View>
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Grand total */}
        <View style={s.totalSection}>
          <View style={s.grandTotalBox}>
            <Text style={s.grandTotalLabel}>{L.grandTotal}</Text>
            <Text style={s.grandTotalValue}>{eur(grand_total)}</Text>
          </View>
        </View>

        {/* Notes */}
        {offer.notes && (
          <View style={s.notesBox}>
            <Text style={s.notesLabel}>{L.notes}</Text>
            <Text style={s.notesText}>{offer.notes}</Text>
          </View>
        )}

        {/* General terms */}
        {(lang === 'en' ? company.quote_terms_en : company.quote_terms) && (
          <View style={s.termsBox}>
            <Text style={s.termsLabel}>{L.terms}</Text>
            <Text style={s.termsText}>{lang === 'en' ? company.quote_terms_en : company.quote_terms}</Text>
          </View>
        )}

        {/* Footer — fixed on every page: company · VAT | bank | page */}
        <View style={s.footer} fixed>
          <View style={s.footerTop}>
            <Text style={s.footerMain}>{footerLeft}</Text>
            <Text style={s.footerPage} render={({ pageNumber, totalPages }) => L.page(pageNumber, totalPages)} />
          </View>
          {bankLine ? <Text style={s.footerBank}>{bankLine}</Text> : null}
        </View>

      </Page>
    </Document>
  )
}
