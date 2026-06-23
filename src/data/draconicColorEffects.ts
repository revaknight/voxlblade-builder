export interface DraconicColorAttackStats {
  color: string
  label: string
  dmgMultiplier?: number
  speedMultiplier?: number
  knockbackMultiplier?: number
  cooldownMultiplier?: number
  stunMultiplier?: number
  appliesBurn?: boolean
  appliesWeakness?: boolean
  randomDebuffChances?: number
  healsAndCleanses?: boolean
  heals?: boolean
}

export const DRACONIC_COLOR_ATTACK_STATS: DraconicColorAttackStats[] = [
  { color: 'fire',  label: 'Red',    speedMultiplier: 1.2, appliesBurn: true /* TODO: burn proc not modeled */ },
  { color: 'air',   label: 'White',  speedMultiplier: 2, knockbackMultiplier: 2, cooldownMultiplier: 0.75},
  { color: 'earth', label: 'Green',  dmgMultiplier: 1.5, stunMultiplier: 1.5, speedMultiplier: 0.7 },
  { color: 'water', label: 'Blue',   dmgMultiplier: 1.1, speedMultiplier: 1.2, stunMultiplier: 1.2, healsAndCleanses: true /* TODO: heal/cleanse not modeled */ },
  { color: 'holy',  label: 'Yellow', heals: true /* TODO: heal not modeled */ },
  { color: 'hex',   label: 'Purple', stunMultiplier: 1.2, appliesWeakness: true, randomDebuffChances: 3 /* TODO: debuff procs not modeled */ },
]

const DRACONIC_COLOR_MAP = new Map(DRACONIC_COLOR_ATTACK_STATS.map(c => [c.color, c]))

export function getDraconicColorDmgMultiplier(color: string): number {
  return DRACONIC_COLOR_MAP.get(color)?.dmgMultiplier ?? 1
}

export function getDraconicColorAttackStats(color: string): DraconicColorAttackStats | undefined {
  return DRACONIC_COLOR_MAP.get(color)
}