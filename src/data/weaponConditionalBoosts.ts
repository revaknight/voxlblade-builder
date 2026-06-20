export type WeaponHitScope = 'm1Finisher' | 'm2'

export interface WeaponConditionalBoost {
  perkName: string
  multiplierPerPerk: number
  weaponTypes: string[]
  hitScope: WeaponHitScope
  condition: string
}

export const WEAPON_CONDITIONAL_BOOSTS: WeaponConditionalBoost[] = [
  {
    perkName: 'Aggressive Personality',
    multiplierPerPerk: 0.25,
    weaponTypes: ['War Hammer', 'Dual Mallets'],
    hitScope: 'm1Finisher',
    condition: 'M1 Finisher (ground slam)',
  },
  {
    perkName: 'Aggressive Personality',
    multiplierPerPerk: 0.25,
    weaponTypes: ['Mallet'],
    hitScope: 'm2',
    condition: 'M2 (ground slam)',
  },
]

export function getWeaponConditionalBoost(
  perks: Record<string, number>,
  finalWeaponType: string,
  hitScope: WeaponHitScope,
): { mult: number; labels: string[] } {
  let mult = 1
  const labels: string[] = []
  for (const def of WEAPON_CONDITIONAL_BOOSTS) {
    if (def.hitScope !== hitScope) continue
    if (!def.weaponTypes.includes(finalWeaponType)) continue
    const amt = perks[def.perkName] ?? 0
    if (amt <= 0) continue
    mult *= 1 + def.multiplierPerPerk * amt
    labels.push(def.perkName)
  }
  return { mult: Math.round(mult * 10000) / 10000, labels }
}