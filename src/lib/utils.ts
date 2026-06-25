export function calculateMultiplierFromPct(pct: number): number {
  return Math.round((1 + pct / 100) * 10000) / 10000
}

export function multiplyMultipliers(multipliers: number[]): number {
  return multipliers.reduce((acc, m) => acc * m, 1.0)
}

export function roundMultiplier(multiplier: number): number {
  return Math.round(multiplier * 10000) / 10000
}
