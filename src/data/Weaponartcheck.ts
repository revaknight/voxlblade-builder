import type { WeaponArt } from '../data/weaponArts'

export const SCALE_MAP: Record<string, string> = {
  physicalScaling: 'physical', magicScaling: 'magic',
  fireScaling: 'fire', waterScaling: 'water', earthScaling: 'earth',
  airScaling: 'air', hexScaling: 'hex', holyScaling: 'holy',
  dexterityScaling: 'dexterity', summonScaling: 'summon'
}

export const SCALE_MAP_LABELS: Array<[string, string, string]> = [
  ['physicalScaling', 'physical', 'Physical'],
  ['magicScaling', 'magic', 'Magic'],
  ['fireScaling', 'fire', 'Fire'],
  ['waterScaling', 'water', 'Water'],
  ['earthScaling', 'earth', 'Earth'],
  ['airScaling', 'air', 'Air'],
  ['hexScaling', 'hex', 'Hex'],
  ['holyScaling', 'holy', 'Holy'],
  ['dexterityScaling', 'dexterity', 'Dexterity'],
  ['summonScaling', 'summon', 'Summon'],
]

export function passesAtLeastOneScaling(
  req: WeaponArt['requirements'],
  waScalings: Record<string, number>
): boolean {
  if (!req.atLeastOneScaling) return true

  return Object.entries(req.atLeastOneScaling).some(([reqKey, minVal]) => {
    const scalingKey = SCALE_MAP[reqKey as keyof typeof SCALE_MAP]
    return scalingKey != null && (waScalings[scalingKey] ?? 0) >= (minVal ?? 0)
  })
}

export function checkWA(
  wa: WeaponArt,
  scalings: Record<string, number>,
  stats: Record<string, number>,
  finalWeaponType: string,
  isMonk: boolean,
  bladeName: string,
  handleName: string
): boolean {
  const req = wa.requirements

  if (wa.isMonk && !isMonk) return false
  if (req.guild === 'Monk' && !isMonk) return false

  if (req.bothParts) {
    const has = req.bothParts.every(p => p === bladeName || p === handleName)
    if (!has) return false
  }

  if (!passesAtLeastOneScaling(req, scalings)) return false

  const isScalingExempt = req.scalingExemptWeaponTypes?.includes(finalWeaponType) ?? false

  if (!isScalingExempt) {
    for (const [reqKey, scalingKey] of Object.entries(SCALE_MAP)) {
      const needed = (req as any)[reqKey]
      if (needed != null && (scalings[scalingKey] ?? 0) < needed) return false
    }
  }

  if (req.physicalDefense != null && (stats.physicalDefense ?? 0) < req.physicalDefense) return false
  if (req.magicBoost != null && (stats.magicBoost ?? 0) < req.magicBoost) return false
  if (req.holyBoost != null && (stats.holyBoost ?? 0) < req.holyBoost) return false
  if (req.summonBoost != null && (stats.summonBoost ?? 0) < req.summonBoost) return false
  if (req.heatResistance != null && (stats.heatResistance ?? 0) < req.heatResistance) return false
  if (req.tenacity != null && (stats.tenacity ?? 0) < req.tenacity) return false

  if (req.weaponType && req.weaponType.length > 0) {
    if (!req.weaponType.some(t => t === finalWeaponType)) return false
  }

  return true
}

export function getUnmetReqs(
  wa: WeaponArt,
  scalings: Record<string, number>,
  stats: Record<string, number>,
  finalWeaponType: string,
  isMonk: boolean,
  bladeName: string,
  handleName: string
): string[] {
  const req = wa.requirements
  if (!req) return []
  
  const unmet: string[] = []

  if (req.guild && !isMonk) unmet.push(`Guild: ${req.guild}`)
  if (req.weaponType?.length && !req.weaponType.some(t => t === finalWeaponType))
    unmet.push(`Weapon: ${req.weaponType.join(' / ')}`)

  const isScalingExempt = req.scalingExemptWeaponTypes?.includes(finalWeaponType) ?? false

  if (!isScalingExempt) {
    for (const [reqKey, scalingKey, label] of SCALE_MAP_LABELS) {
      const needed = (req as any)[reqKey]
      if (needed != null && (scalings[scalingKey] ?? 0) < needed)
        unmet.push(`${label} Scaling ≥ ${needed}`)
    }

    if (req.atLeastOneScaling) {
      const passes = Object.entries(req.atLeastOneScaling).some(([reqKey, minVal]) => {
        const entry = SCALE_MAP_LABELS.find(([rk]) => rk === reqKey)
        return entry != null && (scalings[entry[1]] ?? 0) >= (minVal ?? 0)
      })
      if (!passes) {
        const parts = Object.entries(req.atLeastOneScaling).map(([reqKey, minVal]) => {
          const entry = SCALE_MAP_LABELS.find(([rk]) => rk === reqKey)
          return `${entry?.[2] ?? reqKey} Scaling ≥ ${minVal}`
        })
        unmet.push(`At least one of: ${parts.join(' / ')}`)
      }
    }
  }

  if (req.magicBoost != null && (stats.magicBoost ?? 0) < req.magicBoost) unmet.push(`Magic Boost ≥ +${req.magicBoost}%`)
  if (req.holyBoost != null && (stats.holyBoost ?? 0) < req.holyBoost) unmet.push(`Holy Boost ≥ +${req.holyBoost}%`)
  if (req.summonBoost != null && (stats.summonBoost ?? 0) < req.summonBoost) unmet.push(`Summon Boost ≥ +${req.summonBoost}%`)
  if (req.heatResistance != null && (stats.heatResistance ?? 0) < req.heatResistance) unmet.push(`Heat Resistance ≥ ${req.heatResistance}%`)
  if (req.tenacity != null && (stats.tenacity ?? 0) < req.tenacity) unmet.push(`Tenacity ≥ ${req.tenacity}`)
  if (req.physicalDefense != null && (stats.physicalDefense ?? 0) < req.physicalDefense) unmet.push(`Physical Defense ≥ +${req.physicalDefense}%`)
  if (req.bothParts && !req.bothParts.every(p => p === bladeName || p === handleName))
    unmet.push(`Cần cả: ${req.bothParts.join(' + ')}`)

  return unmet
}