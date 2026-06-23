import * as pdfjsLib from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl

// Render the first page of a PDF (by URL) to a PNG data URL for use as a thumbnail.
export async function pdfFirstPageThumb(url: string, maxW = 320): Promise<string | null> {
  try {
    const pdf = await pdfjsLib.getDocument(url).promise
    const page = await pdf.getPage(1)
    const base = page.getViewport({ scale: 1 })
    const viewport = page.getViewport({ scale: Math.min(2, maxW / base.width) })
    const canvas = document.createElement('canvas')
    canvas.width = Math.ceil(viewport.width)
    canvas.height = Math.ceil(viewport.height)
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    await page.render({ canvasContext: ctx, viewport }).promise
    return canvas.toDataURL('image/png')
  } catch (e) {
    console.error('pdf thumb', e)
    return null
  }
}
