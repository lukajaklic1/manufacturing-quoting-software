import { useState } from 'react'
import { Upload, File, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface QuoteAttachmentsProps {
  quoteId?: string
  companyId: string
  attachments: any[]
  onChange: (attachments: any[]) => void
}

export default function QuoteAttachments({ quoteId, companyId, attachments, onChange }: QuoteAttachmentsProps) {
  const [uploading, setUploading] = useState(false)

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || !quoteId) return
    setUploading(true)

    for (const file of e.target.files) {
      try {
        const path = `${companyId}/quotes/${quoteId}/${Date.now()}_${file.name}`
        const { error } = await supabase.storage.from('quotations').upload(path, file)
        if (error) throw error

        const att = {
          id: `att_${Date.now()}_${Math.random()}`,
          quote_id: quoteId,
          file_name: file.name,
          file_size: file.size,
          storage_path: path,
          created_at: new Date().toISOString(),
        }
        onChange([...attachments, att])
      } catch (err) {
        console.error('Upload failed:', err)
      }
    }
    setUploading(false)
    e.target.value = ''
  }

  async function deleteFile(att: any) {
    try {
      await supabase.storage.from('quotations').remove([att.storage_path])
      onChange(attachments.filter(a => a.id !== att.id))
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-4">
      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-gray-700">Files</span>
        <div className="flex items-center gap-2">
          <input
            type="file"
            multiple
            onChange={handleFileUpload}
            disabled={uploading || !quoteId}
            className="hidden"
            id="quote-upload"
          />
          <label htmlFor="quote-upload" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
            <Upload className="w-4 h-4" />
            {uploading ? 'Uploading...' : 'Upload Files'}
          </label>
        </div>
      </label>

      {attachments.length > 0 && (
        <div className="flex flex-col gap-2">
          {attachments.map(att => (
            <div key={att.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <File className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <span className="text-sm text-gray-700 truncate">{att.file_name}</span>
              </div>
              <button
                onClick={() => deleteFile(att)}
                className="ml-2 p-1 text-gray-400 hover:text-red-600 flex-shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
