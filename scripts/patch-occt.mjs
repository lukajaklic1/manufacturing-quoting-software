// Ensure online-3d-viewer loads occt-import-js from jsDelivr CDN (default).
// If a previous patch redirected to self-hosted /occt/, this reverts it.
import { readFileSync, writeFileSync, existsSync } from 'fs'

const file = 'node_modules/online-3d-viewer/build/engine/o3dv.module.js'
const from = "globalThis.location.origin + '/occt/'"
const to = "'https://cdn.jsdelivr.net/npm/occt-import-js@0.0.22/dist/'"

if (!existsSync(file)) {
  console.log('patch-occt: module not found, skipped')
  process.exit(0)
}
let src = readFileSync(file, 'utf8')
if (src.includes(from)) {
  writeFileSync(file, src.replace(from, to))
  console.log('patch-occt: reverted to CDN')
} else if (src.includes(to)) {
  console.log('patch-occt: already using CDN, ok')
} else {
  console.log('patch-occt: pattern not found — skipped')
}
