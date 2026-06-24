import { useState } from 'react'
import { Upload, X, FileText, Box, Download } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface QuoteAttachmentsProps {
  quoteId?: string
  companyId: string
  quoteItemId?: string
  attachments: any[]
  onChange: (attachments: any[]) => void
  inline?: boolean
  readonly?: boolean
}

export default function QuoteAttachments({ quoteId, attachments, onChange, readonly }: QuoteAttachmentsProps) {
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<any>(null)

  async function handleFileUpload(files: FileList) {
    if (!files || !quoteId) return
    setUploading(true)
    
    for (const file of files) {
      try {
        const path = `quotes/${quoteId}/${Date.now()}_${file.name}`
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
  }

  async function deleteFile(att: any) {
    try {
      await supabase.storage.from('quotations').remove([att.storage_path])
      onChange(attachments.filter(a => a.id !== att.id))
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }

  function getFileType(fileName: string) {
    const ext = fileName.split('.').pop()?.toLowerCase() || ''
    const cadExts = ['step', 'stp', 'iges', 'igs', 'stl', 'obj', 'glb', 'gltf']
    const drawingExts = ['pdf', 'dwg', 'dxf']
    
    if (cadExts.includes(ext)) return 'CAD'
    if (drawingExts.includes(ext)) return 'Risba'
    if (ext === 'csv') return 'BOM'
    return 'Drugo'
  }

  async function downloadFile(att: any) {
    try {
      const { data } = await supabase.storage.from('quotations').createSignedUrl(att.storage_path, 3600)
      if (data?.signedUrl) window.open(data.signedUrl, '_blank')
    } catch (err) {
      console.error('Download failed:', err)
    }
  }

  const fileGroups = {
    'Risba': attachments.filter(a => getFileType(a.file_name) === 'Risba'),
    'CAD': attachments.filter(a => getFileType(a.file_name) === 'CAD'),
    'BOM': attachments.filter(a => getFileType(a.file_name) === 'BOM'),
    'Drugo': attachments.filter(a => getFileType(a.file_name) === 'Drugo'),
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {!readonly && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400">
          <label className="cursor-pointer block">
            <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
            <span className="text-sm text-gray-600">
              {uploading ? 'Nalagam...' : 'Povleci datoteke ali klikni za izbiro'}
            </span>
            <input
              type="file"
              multiple
              onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>
      )}

      {/* File Type Tabs */}
      <div className="flex gap-2 border-b">
        {Object.entries(fileGroups).map(([type, files]) => (
          <button
            key={type}
            onClick={() => setSelectedFile(files.length > 0 ? files[0] : null)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
              files.length === 0
                ? 'text-gray-400 border-transparent'
                : selectedFile?.file_name?.includes(files[0]?.file_name)
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
          >
            {type} ({files.length})
          </button>
        ))}
      </div>

      {/* Gallery */}
      <div className="grid grid-cols-3 gap-2">
        {attachments.map((att) => (
          <div
            key={att.id}
            onClick={() => setSelectedFile(att)}
            className={`relative group p-2 rounded border-2 cursor-pointer transition ${
              selectedFile?.id === att.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-400'
            }`}
          >
            <div className="aspect-square bg-gray-100 rounded flex items-center justify-center mb-1">
              {getFileType(att.file_name) === 'CAD' ? (
                <Box className="w-8 h-8 text-blue-500" />
              ) : (
                <FileText className="w-8 h-8 text-gray-500" />
              )}
            </div>
            <p className="text-xs font-medium truncate">{att.file_name}</p>
            <p className="text-xs text-gray-500">{(att.file_size / 1024).toFixed(0)} kB</p>
            <span className="absolute top-1 right-1 bg-blue-600 text-white text-xs px-2 py-1 rounded hidden group-hover:inline">
              {getFileType(att.file_name)}
            </span>
            {!readonly && (
              <button
                onClick={(e) => { e.stopPropagation(); deleteFile(att) }}
                className="absolute top-1 left-1 bg-red-600 text-white p-1 rounded hidden group-hover:inline"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* File Actions */}
      {selectedFile && (
        <div className="flex gap-2 pt-4 border-t">
          <button
            onClick={() => downloadFile(selectedFile)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <Download className="w-4 h-4" />
            Prenosit
          </button>
          <span className="text-sm text-gray-600 flex-1">
            {selectedFile.file_name} • {(selectedFile.file_size / 1024).toFixed(0)} kB
          </span>
        </div>
      )}
    </div>
  )
}
