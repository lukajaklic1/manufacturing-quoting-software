import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { OfferSnapshot } from '../types/database'

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica' },
  header: { marginBottom: 20, borderBottomWidth: 2, paddingBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 5 },
  grid: { flexDirection: 'row', marginBottom: 15, gap: 20 },
  col: { flex: 1 },
  label: { fontSize: 8, color: '#666', marginBottom: 2 },
  value: { fontSize: 10, fontWeight: 'bold', marginBottom: 5 },
  section: { marginBottom: 15 },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', marginBottom: 8, borderBottomWidth: 1, paddingBottom: 4 },
  table: { width: '100%', marginVertical: 10 },
  row: { flexDirection: 'row', borderBottomWidth: 1, paddingVertical: 4 },
  cell: { flex: 1, paddingHorizontal: 5, fontSize: 9 },
  total: { fontSize: 14, fontWeight: 'bold', textAlign: 'right', marginTop: 10 },
})

export default function OfferPdf({ snap }: { snap: OfferSnapshot }) {
  if (!snap) return <Document><Page><Text>No data</Text></Page></Document>

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{snap.offer.number}</Text>
          <Text style={styles.label}>Issued: {new Date(snap.offer.issued_at).toLocaleDateString()}</Text>
        </View>

        {/* Company & Customer Info */}
        <View style={styles.grid}>
          <View style={styles.col}>
            <Text style={styles.label}>OUR COMPANY</Text>
            <Text style={styles.value}>{snap.company.name}</Text>
            <Text style={styles.label}>{snap.company.address}</Text>
            <Text style={styles.label}>{snap.company.phone}</Text>
            <Text style={styles.label}>{snap.company.email}</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>CUSTOMER</Text>
            <Text style={styles.value}>{snap.customer.name}</Text>
            {snap.customer.address && <Text style={styles.label}>{snap.customer.address}</Text>}
            {snap.customer.contact_person && <Text style={styles.label}>{snap.customer.contact_person}</Text>}
            {snap.customer.contact_phone && <Text style={styles.label}>{snap.customer.contact_phone}</Text>}
            {snap.customer.contact_email && <Text style={styles.label}>{snap.customer.contact_email}</Text>}
          </View>
        </View>

        {/* Terms */}
        <View style={styles.section}>
          <View style={styles.row}>
            <View style={styles.col}><Text style={styles.label}>Valid Until: {snap.offer.valid_until || 'N/A'}</Text></View>
            <View style={styles.col}><Text style={styles.label}>Lead Time: {snap.offer.lead_time || 'N/A'}</Text></View>
            <View style={styles.col}><Text style={styles.label}>Terms: {snap.offer.payment_terms || 'N/A'}</Text></View>
          </View>
        </View>

        {/* Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ITEMS</Text>
          {snap.items.map((item, idx) => (
            <View key={idx} style={styles.row}>
              <View style={{ flex: 2 }}>
                <Text>{item.name} {item.number && `(${item.number})`}</Text>
              </View>
              <View style={{ flex: 1 }}><Text>{item.quantities[0]?.qty || 0} {item.unit}</Text></View>
              <View style={{ flex: 1 }}><Text>{item.quantities[0]?.unit_price?.toLocaleString('de-DE', { style: 'currency', currency: snap.offer.currency }) || '0 €'}</Text></View>
              <View style={{ flex: 1 }}><Text>{item.quantities[0]?.total?.toLocaleString('de-DE', { style: 'currency', currency: snap.offer.currency }) || '0 €'}</Text></View>
            </View>
          ))}
        </View>

        {/* Total */}
        <Text style={styles.total}>
          Total: {snap.grand_total?.toLocaleString('de-DE', { style: 'currency', currency: snap.offer.currency }) || '0 €'}
        </Text>

        {snap.offer.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>NOTES</Text>
            <Text>{snap.offer.notes}</Text>
          </View>
        )}
      </Page>
    </Document>
  )
}
