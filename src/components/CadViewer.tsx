import { useEffect, useRef, useState } from 'react'
import * as OV from 'online-3d-viewer'

// occt-import-js / draco / rhino wasm libs are fetched automatically from jsDelivr by the library at load time.
export default function CadViewer({ url, fileName }: { url: string; fileName: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let viewer: any
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(url)
        const blob = await res.blob()
        const file = new File([blob], fileName)
        if (cancelled || !ref.current) return
        ref.current.innerHTML = '' // ensure no stale canvas from a previous model
        viewer = new OV.EmbeddedViewer(ref.current, {
          backgroundColor: new OV.RGBAColor(244, 245, 247, 255),
          defaultColor: new OV.RGBColor(160, 162, 168),
        })
        viewer.LoadModelFromFileList([file])
      } catch (e) {
        console.error('cad viewer', e)
        if (!cancelled) setError(true)
      }
    })()
    return () => { cancelled = true; try { viewer?.Destroy?.() } catch { /* noop */ } }
  }, [url, fileName])

  if (error) return <div className="w-full h-full flex items-center justify-center text-white/70 text-sm">3D predogleda ni bilo mogoče naložiti.</div>
  return <div ref={ref} className="w-full h-full" />
}
