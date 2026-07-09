import { round4 } from './engine/_utils'

export function resolveDamageTypes(
  baseTypes: Record<string, number>,
  bonuses: Record<string, number>
): Record<string, number> {
  if (Object.keys(bonuses).length === 0) return baseTypes
  const out = { ...baseTypes }
  for (const [k, v] of Object.entries(bonuses)) {
    out[k] = round4((out[k] ?? 0) + v)
  }
  return out
}

/** Convert 50% of Fire↔Air damage (Echo Incineration). */
export function applyFireAirConversion(types: Record<string, number>): Record<string, number> {
  const fire = types.fire ?? 0
  const air = types.air ?? 0
  if (fire === 0 && air === 0) return types
  const result = { ...types }
  const fireToAir = round4(fire * 0.5)
  const airToFire = round4(air * 0.5)
  result.fire = round4(fire - fireToAir + airToFire)
  result.air = round4(air - airToFire + fireToAir)
  return result
}

/** Convert a fraction of Air damage to Magic damage (e.g. for Spirit Winds). */
export function applyAirToMagicConversion(
  types: Record<string, number>,
  conversionRate: number,
  darkMagicHex?: number,
  echoIncinerateAmt?: number,
): Record<string, number> {
  let result = { ...types }
  // Spirit Winds first: convert Air → Magic BEFORE Echo Incineration
  // so that converted Air from Fire↔Air is NOT re-converted
  if (conversionRate > 0) {
    const airAmount = result.air ?? 0
    if (airAmount > 0) {
      const converted = round4(airAmount * conversionRate)
      if (converted > 0) {
        result.air = round4(airAmount - converted)
        result.magic = round4((result.magic ?? 0) + converted)
      }
    }
  }
  if (echoIncinerateAmt && echoIncinerateAmt > 0) {
    result = applyFireAirConversion(result)
  }
  if (darkMagicHex && darkMagicHex > 0 && (result.magic ?? 0) > 0) {
    result.hex = round4((result.hex ?? 0) + darkMagicHex)
  }
  return result
}