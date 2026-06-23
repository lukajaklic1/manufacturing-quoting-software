import { Document, Page, Text } from '@react-pdf/renderer'

interface OfferPdfProps {
  snap: any
}

export default function OfferPdf({ snap }: OfferPdfProps) {
  return (
    <Document>
      <Page size="A4" style={{ padding: 40 }}>
        <Text>{snap?.offer?.number || 'Quote'}</Text>
      </Page>
    </Document>
  )
}
