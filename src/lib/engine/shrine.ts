import type { StatMap } from '../types'
import { STAT_KEYS } from '../types'
import { round2 } from './_utils'

export const SHRINE_MULTIPLIERS: Record<number, number> = {
  1: 3.0, 2: 1.7, 3: 1.4, 4: 1.1, 5: 1.0,
}

export function applyShrineToScalings(
  scalings: Record<string, number>,
  tier:     number,
): Record<string, number> {
  const mult = SHRINE_MULTIPLIERS[tier] ?? 1.0
  if (mult === 1.0) return { ...scalings }
  const result: Record<string, number> = {}
  for (const k in scalings) {
    if (Object.prototype.hasOwnProperty.call(scalings, k)) result[k] = scalings[k] * mult
  }
  return result
}

export function applyShrineToStats(stats: StatMap | undefined | null, tier: number): StatMap {
  if (!stats) return {}
  const mult   = SHRINE_MULTIPLIERS[tier] ?? 1.0
  const result: StatMap = {}
  for (let i = 0; i < STAT_KEYS.length; i++) {
    const k = STAT_KEYS[i]
    const v = stats[k]
    if (v == null) continue
    result[k] = (mult === 1.0) ? v : round2(v * mult)
  }
  return result
}
