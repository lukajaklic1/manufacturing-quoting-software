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
  primary: '#1d4ed8',
  text: '#111827',
  muted: '#6b7280',
  border: '#e5e7eb',
  bg: '#f9fafb',
  white: '#ffffff',
}

const s = StyleSheet.create({
  page: { fontFamily: 'Roboto', fontSize: 9, color: c.text, paddingHorizontal: 40, paddingVertical: 36, backgroundColor: c.white },

  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  companyBlock: { flex: 1 },
  companyName: { fontSize: 14, fontWeight: 700, color: c.primary, marginBottom: 3 },
  companyDetail: { fontSize: 8, color: c.muted, lineHeight: 1.5 },
  titleBlock: { alignItems: 'flex-end' },
  titleLabel: { fontSize: 22, fontWeight: 700, color: c.primary, marginBottom: 4 },
  titleNumber: { fontSize: 12, color: c.muted },
  titleDate: { fontSize: 8, color: c.muted, marginTop: 2 },

  infoRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  infoBox: { flex: 1, backgroundColor: c.bg, borderRadius: 4, padding: 10 },
  infoLabel: { fontSize: 7, color: c.muted, textTransform: 'uppercase', marginBottom: 4, letterSpacing: 0.5 },
  infoValue: { fontSize: 9, fontWeight: 700, marginBottom: 2 },
  infoDetail: { fontSize: 8, color: c.muted, lineHeight: 1.5 },

  termsRow: { flexDirection: 'row', backgroundColor: c.primary, borderRadius: 4, paddingVertical: 7, paddingHorizontal: 10, marginBottom: 20 },
  termItem: { flex: 1, alignItems: 'center' },
  termLabel: { fontSize: 7, color: 'rgba(255,255,255,0.7)', marginBottom: 2 },
  termValue: { fontSize: 9, color: c.white, fontWeight: 700 },
  termDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 2 },

  tableHeader: { flexDirection: 'row', backgroundColor: c.bg, paddingVertical: 6, paddingHorizontal: 8, borderBottomWidth: 2, borderBottomColor: c.primary },
  thText: { fontSize: 7.5, fontWeight: 700, color: c.muted },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: c.border, paddingVertical: 8, paddingHorizontal: 8 },
  tableRowAlt: { backgroundColor: '#fafafa' },

  colPos: { width: 24 },
  colThumb: { width: 52 },
  colName: { flex: 1, paddingRight: 6 },
  colQty: { width: 40 },
  colUnit: { width: 28 },
  colPrice: { width: 64 },
  colTotal: { width: 68 },

  itemName: { fontSize: 9, fontWeight: 700, marginBottom: 2 },
  itemNumber: { fontSize: 7.5, color: c.muted },
  thumbImg: { width: 44, height: 36, objectFit: 'contain', borderRadius: 3 },
  thumbPlaceholder: { width: 44, height: 36, backgroundColor: c.bg, borderRadius: 3 },

  itemRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: c.border, paddingVertical: 8, paddingHorizontal: 8 },
  posText: { fontSize: 9, fontWeight: 700, color: c.primary },
  qtyTable: { width: 40 + 28 + 64 + 68 },
  qtyLine: { flexDirection: 'row', paddingVertical: 2 },
  qtyLineBorder: { borderTopWidth: 1, borderTopColor: '#eef0f2' },

  totalSection: { marginTop: 10, alignItems: 'flex-end' },
  grandTotalBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: c.primary, borderRadius: 4, paddingVertical: 10, paddingHorizontal: 16, width: 280 },
  grandTotalLabel: { fontSize: 10, fontWeight: 700, color: c.white },
  grandTotalValue: { fontSize: 13, fontWeight: 700, color: c.white, textAlign: 'right' },

  notesBox: { marginTop: 20, backgroundColor: c.bg, borderRadius: 4, padding: 10 },
  notesLabel: { fontSize: 7, color: c.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  notesText: { fontSize: 8.5, lineHeight: 1.6 },

  footer: { position: 'absolute', bottom: 20, left: 40, right: 40, flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: c.border, paddingTop: 6 },
  footerText: { fontSize: 7, color: c.muted },
})

function eur(n: number) {
  return n.toLocaleString('sl-SI', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'
}

function fmtDate(d: string | null | undefined) {
  if (!d) return '—'
  try { return new Date(d).toLocaleDateString('sl-SI') } catch { return String(d) }
}

export default function OfferPdf({ snap }: { snap: OfferSnapshot }) {
  if (!snap) return <Document><Page><Text>Ni podatkov</Text></Page></Document>

  const { offer, company, customer, items, grand_total } = snap

  return (
    <Document>
      <Page size="A4" style={s.page}>

        {/* Header */}
        <View style={s.headerRow}>
          <View style={s.companyBlock}>
            <Text style={s.companyName}>{company.name}</Text>
            {company.address && <Text style={s.companyDetail}>{company.address}</Text>}
            {company.phone && <Text style={s.companyDetail}>{company.phone}</Text>}
            {company.email && <Text style={s.companyDetail}>{company.email}</Text>}
            {company.tax_id && <Text style={s.companyDetail}>ID za DDV: {company.tax_id}</Text>}
          </View>
          <View style={s.titleBlock}>
            <Text style={s.titleLabel}>PONUDBA</Text>
            <Text style={s.titleNumber}>{offer.number}</Text>
            <Text style={s.titleDate}>Datum: {fmtDate(offer.issued_at)}</Text>
          </View>
        </View>

        {/* Info boxes */}
        <View style={s.infoRow}>
          <View style={s.infoBox}>
            <Text style={s.infoLabel}>Naše podjetje</Text>
            <Text style={s.infoValue}>{company.name}</Text>
            {company.address && <Text style={s.infoDetail}>{company.address}</Text>}
            {company.tax_id && <Text style={s.infoDetail}>ID DDV: {company.tax_id}</Text>}
            {company.bank_iban && <Text style={s.infoDetail}>IBAN: {company.bank_iban}</Text>}
            {company.bank_name && <Text style={s.infoDetail}>{company.bank_name}</Text>}
          </View>
          <View style={s.infoBox}>
            <Text style={s.infoLabel}>Kupec</Text>
            <Text style={s.infoValue}>{customer.name}</Text>
            {customer.address && <Text style={s.infoDetail}>{customer.address}</Text>}
            {customer.vat_number && <Text style={s.infoDetail}>ID DDV: {customer.vat_number}</Text>}
            {customer.contact_person && <Text style={s.infoDetail}>{customer.contact_person}</Text>}
            {customer.contact_email && <Text style={s.infoDetail}>{customer.contact_email}</Text>}
            {customer.contact_phone && <Text style={s.infoDetail}>{customer.contact_phone}</Text>}
          </View>
        </View>

        {/* Terms strip */}
        <View style={s.termsRow}>
          <View style={s.termItem}>
            <Text style={s.termLabel}>Veljavnost</Text>
            <Text style={s.termValue}>{fmtDate(offer.valid_until)}</Text>
          </View>
          <View style={s.termDivider} />
          <View style={s.termItem}>
            <Text style={s.termLabel}>Rok dobave</Text>
            <Text style={s.termValue}>{offer.lead_time || '—'}</Text>
          </View>
          <View style={s.termDivider} />
          <View style={s.termItem}>
            <Text style={s.termLabel}>Plačilni pogoji</Text>
            <Text style={s.termValue}>{offer.payment_terms || '—'}</Text>
          </View>
          <View style={s.termDivider} />
          <View style={s.termItem}>
            <Text style={s.termLabel}>Paritetni pogoji</Text>
            <Text style={s.termValue}>{offer.parity || '—'}</Text>
          </View>
          <View style={s.termDivider} />
          <View style={s.termItem}>
            <Text style={s.termLabel}>Valuta</Text>
            <Text style={s.termValue}>{offer.currency}</Text>
          </View>
        </View>

        {/* Table header */}
        <View style={s.tableHeader}>
          <View style={s.colPos}><Text style={s.thText}>Pos.</Text></View>
          <View style={s.colThumb} />
          <View style={s.colName}><Text style={s.thText}>Naziv kosa</Text></View>
          <View style={s.colQty}><Text style={[s.thText, { textAlign: 'right' }]}>Kol.</Text></View>
          <View style={s.colUnit}><Text style={[s.thText, { textAlign: 'center' }]}>Enota</Text></View>
          <View style={s.colPrice}><Text style={[s.thText, { textAlign: 'right' }]}>Cena/kos</Text></View>
          <View style={s.colTotal}><Text style={[s.thText, { textAlign: 'right' }]}>Skupaj</Text></View>
        </View>

        {items.map((item, idx) => {
          const rows = item.quantities
          return (
            <View key={idx} style={[s.itemRow, idx % 2 === 1 ? s.tableRowAlt : {}]} wrap={false}>
              <View style={s.colPos}><Text style={s.posText}>{idx + 1}</Text></View>
              <View style={s.colThumb}>
                {item.thumb
                  ? <Image style={s.thumbImg} src={item.thumb} />
                  : <View style={s.thumbPlaceholder} />}
              </View>
              <View style={s.colName}>
                <Text style={s.itemName}>{item.name}</Text>
                {item.number && <Text style={s.itemNumber}>{item.number}</Text>}
              </View>
              {/* Quantity breaks to the right of the part image */}
              <View style={s.qtyTable}>
                {rows.map((q, qi) => (
                  <View key={qi} style={[s.qtyLine, qi > 0 ? s.qtyLineBorder : {}]}>
                    <View style={s.colQty}><Text style={{ fontSize: 9, fontWeight: 700, textAlign: 'right' }}>{q.qty}</Text></View>
                    <View style={s.colUnit}><Text style={{ fontSize: 9, textAlign: 'center', color: c.muted }}>{item.unit}</Text></View>
                    <View style={s.colPrice}><Text style={{ fontSize: 9, textAlign: 'right' }}>{eur(q.unit_price)}</Text></View>
                    <View style={s.colTotal}><Text style={{ fontSize: 9, fontWeight: 700, textAlign: 'right' }}>{eur(q.total)}</Text></View>
                  </View>
                ))}
              </View>
            </View>
          )
        })}

        {/* Grand total */}
        <View style={s.totalSection}>
          <View style={s.grandTotalBox}>
            <Text style={s.grandTotalLabel}>SKUPAJ BREZ DDV</Text>
            <Text style={s.grandTotalValue}>{eur(grand_total)}</Text>
          </View>
        </View>

        {/* Notes */}
        {offer.notes && (
          <View style={s.notesBox}>
            <Text style={s.notesLabel}>Opombe</Text>
            <Text style={s.notesText}>{offer.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>{company.name} · {offer.number}</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `Stran ${pageNumber} / ${totalPages}`} />
        </View>

      </Page>
    </Document>
  )
}
