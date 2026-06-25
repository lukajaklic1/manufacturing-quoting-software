import * as OV from 'online-3d-viewer'

export async function cadThumb(id: string, url: string, fileName: string): Promise<string | null> {
  const key = `cadthumb_${id}`
  const cached = sessionStorage.getItem(key)
  if (cached) return cached

  return new Promise((resolve) => {
    const container = document.createElement('div')
    container.style.cssText = 'position:fixed;left:-9999px;top:0;width:240px;height:180px;visibility:hidden;'
    document.body.appendChild(container)

    let done = false
    function finish(result: string | null) {
      if (done) return
      done = true
      try { document.body.removeChild(container) } catch {}
      resolve(result)
    }

    const timeout = setTimeout(() => finish(null), 20000)

    function capture() {
      const canvas = container.querySelector('canvas')
      if (!canvas) { finish(null); return }
      try {
        const dataUrl = canvas.toDataURL('image/jpeg', 0.75)
        sessionStorage.setItem(key, dataUrl)
        clearTimeout(timeout)
        finish(dataUrl)
      } catch {
        clearTimeout(timeout)
        finish(null)
      }
    }

    fetch(url)
      .then(r => r.blob())
      .then(blob => {
        const file = new File([blob], fileName)
        new OV.EmbeddedViewer(container, {
          backgroundColor: new OV.RGBAColor(244, 245, 247, 255),
          defaultColor: new OV.RGBColor(160, 162, 168),
          onModelLoaded: () => setTimeout(capture, 300),
          onModelLoadError: () => { clearTimeout(timeout); finish(null) },
        } as any).LoadModelFromFileList([file])
      })
      .catch(() => { clearTimeout(timeout); finish(null) })
  })
}
