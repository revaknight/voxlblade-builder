export function resolveDamageTypes(
  baseTypes: Record<string, number>,
  bonuses: Record<string, number>
): Record<string, number> {
  if (Object.keys(bonuses).length === 0) return baseTypes
  const out = { ...baseTypes }
  for (const [k, v] of Object.entries(bonuses)) {
    out[k] = Math.round(((out[k] ?? 0) + v) * 10000) / 10000
  }
  return out
}