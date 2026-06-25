import { useState } from 'react'
import { Upload, File, Trash2, Download, FileText, LayoutGrid, List } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface QuoteAttachmentsProps {
  quoteId?: string
  companyId: string
  quoteItemId?: string
  attachments: any[]
  onChange: (attachments: any[]) => void
  readonly?: boolean
  inline?: boolean
  preview?: boolean
}

type FileType = 'cad' | 'pdf' | 'bom' | 'other'
type ViewMode = 'grid' | 'list'

function getFileType(filename: string): FileType {
  const ext = filename.toLowerCase().split('.').pop() || ''
  const cadExts = ['step', 'stp', 'iges', 'igs', 'stl', 'obj', 'ply', 'fbx']

  if (cadExts.includes(ext)) return 'cad'
  if (ext === 'pdf') return 'pdf'
  if (ext === 'bom' || filename.toLowerCase().includes('bom')) return 'bom'
  return 'other'
}

export default function QuoteAttachments({ quoteId, companyId, quoteItemId, attachments, onChange, readonly, inline, preview }: QuoteAttachmentsProps) {
  const [uploading, setUploading] = useState(false)
  const [filterType, setFilterType] = useState<FileType | 'all'>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [searchTerm, setSearchTerm] = useState('')

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || !quoteId) return
    setUploading(true)

    for (const file of e.target.files) {
      try {
        const folder = quoteItemId ? `${companyId}/quotes/${quoteId}/${quoteItemId}` : `${companyId}/quotes/${quoteId}`
        const path = `${folder}/${Date.now()}_${file.name}`
        const { error } = await supabase.storage.from('quotations').upload(path, file)
        if (error) throw error

        const att = {
          id: `att_${Date.now()}_${Math.random()}`,
          quote_id: quoteId,
          quote_item_id: quoteItemId || null,
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

  async function downloadFile(att: any) {
    try {
      const { data } = await supabase.storage.from('quotations').createSignedUrl(att.storage_path, 3600)
      if (data?.signedUrl) window.open(data.signedUrl, '_blank')
    } catch (err) {
      console.error('Download failed:', err)
    }
  }

  const filtered = quoteItemId ? attachments.filter(a => a.quote_item_id === quoteItemId) : attachments.filter(a => !a.quote_item_id)

  const counts = {
    cad: filtered.filter(a => getFileType(a.file_name) === 'cad').length,
    pdf: filtered.filter(a => getFileType(a.file_name) === 'pdf').length,
    bom: filtered.filter(a => getFileType(a.file_name) === 'bom').length,
    other: filtered.filter(a => getFileType(a.file_name) === 'other').length,
  }

  let displayed = filtered
  if (filterType !== 'all') {
    displayed = filtered.filter(a => getFileType(a.file_name) === filterType)
  }
  if (searchTerm) {
    displayed = displayed.filter(a => a.file_name.toLowerCase().includes(searchTerm.toLowerCase()))
  }

  if (preview) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-4 h-full">
        {/* Header with counter and upload */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <span className="inline-block w-5 h-5 rounded bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">{filtered.length}</span>
            Priloge
          </h3>
          {!readonly && (
            <label className="cursor-pointer">
              <input type="file" multiple onChange={handleFileUpload} disabled={uploading || !quoteId} className="hidden" />
              <span className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1">
                <Upload className="w-4 h-4" />
              </span>
            </label>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2 flex-wrap text-xs font-medium">
          <button
            onClick={() => setFilterType('all')}
            className={`px-2 py-1 rounded ${filterType === 'all' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Vse ({filtered.length})
          </button>
          <button
            onClick={() => setFilterType('cad')}
            className={`px-2 py-1 rounded ${filterType === 'cad' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'}`}
          >
            CAD ({counts.cad})
          </button>
          <button
            onClick={() => setFilterType('pdf')}
            className={`px-2 py-1 rounded ${filterType === 'pdf' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Risba ({counts.pdf})
          </button>
          <button
            onClick={() => setFilterType('bom')}
            className={`px-2 py-1 rounded ${filterType === 'bom' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'}`}
          >
            BOM ({counts.bom})
          </button>
          <button
            onClick={() => setFilterType('other')}
            className={`px-2 py-1 rounded ${filterType === 'other' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Drugo ({counts.other})
          </button>

          {/* View toggle */}
          <div className="ml-auto flex gap-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded ${viewMode === 'grid' ? 'bg-gray-200 text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1 rounded ${viewMode === 'list' ? 'bg-gray-200 text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* File grid/list */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-3 gap-3 flex-1 overflow-y-auto">
            {displayed.length === 0 ? (
              <p className="text-xs text-gray-400 col-span-3">No files</p>
            ) : (
              displayed.map(att => {
                const fileType = getFileType(att.file_name)
                const isCad = fileType === 'cad'
                const isPdf = fileType === 'pdf'

                return (
                  <div key={att.id} className="flex flex-col gap-1 group relative">
                    <div className="w-full h-24 bg-gray-100 rounded border border-gray-200 flex items-center justify-center overflow-hidden relative group-hover:bg-gray-150">
                      {isCad ? (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
                          <svg className="w-12 h-12 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3-8c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3z" />
                          </svg>
                        </div>
                      ) : isPdf ? (
                        <div className="w-full h-full bg-red-50 flex items-center justify-center">
                          <FileText className="w-8 h-8 text-red-300" />
                        </div>
                      ) : (
                        <File className="w-8 h-8 text-gray-300" />
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                        <button onClick={() => downloadFile(att)} className="p-1.5 bg-white rounded hover:bg-gray-50" title="Download">
                          <Download className="w-3 h-3 text-blue-600" />
                        </button>
                        {!readonly && (
                          <button onClick={() => deleteFile(att)} className="p-1.5 bg-white rounded hover:bg-gray-50" title="Delete">
                            <Trash2 className="w-3 h-3 text-red-600" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-xs font-medium text-gray-700 truncate">{att.file_name}</p>
                    <p className="text-xs text-gray-400">{(att.file_size / 1024).toFixed(0)} KB</p>
                  </div>
                )
              })
            )}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-2">
            {displayed.length === 0 ? (
              <p className="text-xs text-gray-400">No files</p>
            ) : (
              displayed.map(att => (
                <div key={att.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200 text-xs group">
                  <File className="w-3 h-3 text-gray-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-gray-700">{att.file_name}</p>
                    <p className="text-gray-400">{(att.file_size / 1024).toFixed(0)} KB</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100">
                    <button onClick={() => downloadFile(att)} className="text-gray-400 hover:text-blue-600 p-0.5">
                      <Download className="w-3 h-3" />
                    </button>
                    {!readonly && (
                      <button onClick={() => deleteFile(att)} className="text-gray-400 hover:text-red-600 p-0.5">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Search input at bottom */}
        <input
          type="text"
          placeholder="Iskanje..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
    )
  }

  if (inline) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-3 h-full overflow-hidden">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">Files</h3>
          {!readonly && (
            <label className="cursor-pointer">
              <input type="file" multiple onChange={handleFileUpload} disabled={uploading || !quoteId} className="hidden" />
              <span className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1">
                <Upload className="w-3.5 h-3.5" />
              </span>
            </label>
          )}
        </div>
        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
          {filtered.length === 0 ? (
            <p className="text-xs text-gray-400">No files</p>
          ) : (
            filtered.map(att => (
              <div key={att.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200 text-xs">
                <File className="w-3 h-3 text-gray-500 flex-shrink-0" />
                <span className="truncate text-gray-700 flex-1 min-w-0">{att.file_name}</span>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => downloadFile(att)} className="text-gray-400 hover:text-blue-600 p-0.5">
                    <Download className="w-3 h-3" />
                  </button>
                  {!readonly && (
                    <button onClick={() => deleteFile(att)} className="text-gray-400 hover:text-red-600 p-0.5">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-4">
      {!readonly && (
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-gray-700">{quoteItemId ? 'Item Files' : 'Quote Files'}</span>
          <div className="flex items-center gap-2">
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              disabled={uploading || !quoteId}
              className="hidden"
              id={quoteItemId ? `item-upload-${quoteItemId}` : 'quote-upload'}
            />
            <label htmlFor={quoteItemId ? `item-upload-${quoteItemId}` : 'quote-upload'} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
              <Upload className="w-4 h-4" />
              {uploading ? 'Uploading...' : 'Upload Files'}
            </label>
          </div>
        </label>
      )}

      {filtered.length > 0 && (
        <div className="flex flex-col gap-2">
          {filtered.map(att => (
            <div key={att.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <File className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <span className="text-sm text-gray-700 truncate">{att.file_name}</span>
              </div>
              <div className="flex gap-1 ml-2">
                <button
                  onClick={() => downloadFile(att)}
                  className="p-1 text-gray-400 hover:text-blue-600"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </button>
                {!readonly && (
                  <button
                    onClick={() => deleteFile(att)}
                    className="ml-1 p-1 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
