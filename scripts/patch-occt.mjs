// Redirect online-3d-viewer's occt loader from the jsDelivr CDN to our self-hosted
// /occt/ files. The blob: worker has a null origin so importScripts needs CORS headers
// on the target — we serve /occt/ with ACAO:* in vercel.json, Vite dev sends ACAO:* by default.
import { readFileSync, writeFileSync, existsSync } from 'fs'

const file = 'node_modules/online-3d-viewer/build/engine/o3dv.module.js'
const from = "'https://cdn.jsdelivr.net/npm/occt-import-js@0.0.22/dist/'"
const to = "globalThis.location.origin + '/occt/'"

if (!existsSync(file)) {
  console.log('patch-occt: module not found, skipped')
  process.exit(0)
}
let src = readFileSync(file, 'utf8')
if (src.includes(from)) {
  writeFileSync(file, src.replace(from, to))
  console.log('patch-occt: applied (occt → self-hosted /occt/)')
} else if (src.includes(to)) {
  console.log('patch-occt: already applied')
} else {
  console.log('patch-occt: pattern not found — skipped')
}
