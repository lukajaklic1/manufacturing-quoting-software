import type { MaterialShape, RawMaterialRow } from '../types/database'

const n = (v: unknown) => Number(v) || 0

// Weight (kg) of one piece of the given shape. Dimensions in mm, density in g/cm³.
// mm³ × (g/cm³) ÷ 1 000 000 = kg
// Volume (mm³) of one unit of the given shape. Dimensions in mm.
export function shapeVolumeMm3(shape: MaterialShape, length: number, width: number, thickness: number, diameter: number, wall: number): number {
  const L = n(length), W = n(width), T = n(thickness), D = n(diameter), t = n(wall)
  if (shape === 'sheet') return L * W * T
  if (shape === 'round_bar') return (Math.PI / 4) * D ** 2 * L
  if (shape === 'rect_bar') return W * T * L
  if (shape === 'round_tube') {
    const inner = Math.max(0, D - 2 * t)
    return (Math.PI / 4) * (D ** 2 - inner ** 2) * L
  }
  if (shape === 'square_tube') {
    const innerW = Math.max(0, W - 2 * t), innerH = Math.max(0, T - 2 * t)
    return (W * T - innerW * innerH) * L
  }
  return 0
}

export function shapeWeight(shape: MaterialShape, length: number, width: number, thickness: number, diameter: number, wall: number, density: number): number {
  return (shapeVolumeMm3(shape, length, width, thickness, diameter, wall) * n(density)) / 1_000_000
}

// Pieces obtained from one stock unit (cost/volume is divided by this). Defaults to 1.
function perStock(r: RawMaterialRow): number {
  const v = n(r.pieces_per_stock) || n(r.qty_per_piece) || 1
  return v > 0 ? v : 1
}

// Weight (kg) of material per finished piece = stock weight ÷ pieces-per-stock.
export function rawWeight(r: RawMaterialRow): number {
  const stockW = r.shape === 'other'
    ? n(r.manual_weight)
    : shapeWeight(r.shape, r.length, r.width, r.thickness, r.diameter, r.wall, r.density)
  return stockW / perStock(r)
}

// Volume (cm³) of material per finished piece. 'other' has no geometric volume. 1 cm³ = 1000 mm³
export function rawVolumeCm3(r: RawMaterialRow): number {
  if (r.shape === 'other') return 0
  return (shapeVolumeMm3(r.shape, r.length, r.width, r.thickness, r.diameter, r.wall) / perStock(r)) / 1000
}
