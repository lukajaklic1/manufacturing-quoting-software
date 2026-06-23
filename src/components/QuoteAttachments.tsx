interface QuoteAttachmentsProps {
  quoteId?: string
  companyId: string
  quoteItemId?: string
  attachments: any[]
  onChange: (attachments: any[]) => void
  inline?: boolean
  readonly?: boolean
}

export default function QuoteAttachments(props: QuoteAttachmentsProps) {
  return <div className="text-sm text-gray-500">Attachments</div>
}
