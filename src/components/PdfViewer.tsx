import { useState } from 'react'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw } from 'lucide-react'

interface PdfViewerProps {
  url: string
  title?: string
}

export default function PdfViewer({ url, title }: PdfViewerProps) {
  // const [numPages, setNumPages] = useState(0)
  const [pageNumber, setPageNumber] = useState(1)
  const [zoom, setZoom] = useState(100)

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-800 text-white p-3 flex items-center justify-between">
        <div className="text-sm font-medium truncate flex-1">{title || 'PDF'}</div>
        <div className="flex items-center gap-2">
          <button onClick={() => setPageNumber(Math.max(1, pageNumber - 1))} className="p-1 hover:bg-gray-700 rounded">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs min-w-16 text-center">{pageNumber} / {numPages || '?'}</span>
          <button onClick={() => setPageNumber(pageNumber + 1)} className="p-1 hover:bg-gray-700 rounded">
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-gray-700 mx-2"></div>
          <button onClick={() => setZoom(Math.max(50, zoom - 10))} className="p-1 hover:bg-gray-700 rounded">
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs min-w-12 text-center">{zoom}%</span>
          <button onClick={() => setZoom(Math.min(200, zoom + 10))} className="p-1 hover:bg-gray-700 rounded">
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-gray-700 mx-2"></div>
          <button onClick={() => setZoom(100)} className="p-1 hover:bg-gray-700 rounded">
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Viewer */}
      <div className="flex-1 overflow-auto bg-gray-900 p-4">
        <iframe
          src={`${url}#page=${pageNumber}&zoom=${zoom}`}
          className="w-full h-full border-0"
          title="PDF Viewer"
        />
      </div>
    </div>
  )
}
