export interface DraconicColorAttackStats {
  color: string
  label: string
  colorHex: string
  stat: string
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
  { color: 'fire',  label: 'Red',    colorHex: '#ef4444', stat: 'fire',  speedMultiplier: 1.2, appliesBurn: true /* TODO: burn proc not modeled */ },
  { color: 'air',   label: 'White',  colorHex: '#e5e7eb', stat: 'air',   speedMultiplier: 2, knockbackMultiplier: 2, cooldownMultiplier: 0.75},
  { color: 'earth', label: 'Green',  colorHex: '#22c55e', stat: 'earth', dmgMultiplier: 1.5, stunMultiplier: 1.5, speedMultiplier: 0.7 },
  { color: 'water', label: 'Blue',   colorHex: '#3b82f6', stat: 'water', dmgMultiplier: 1.1, speedMultiplier: 1.2, stunMultiplier: 1.2, healsAndCleanses: true /* TODO: heal/cleanse not modeled */ },
  { color: 'holy',  label: 'Yellow', colorHex: '#eab308', stat: 'holy',  heals: true /* TODO: heal not modeled */ },
  { color: 'hex',   label: 'Purple', colorHex: '#a855f7', stat: 'hex',   stunMultiplier: 1.2, appliesWeakness: true, randomDebuffChances: 3 /* TODO: debuff procs not modeled */ },
]

const DRACONIC_COLOR_MAP = new Map(DRACONIC_COLOR_ATTACK_STATS.map(c => [c.color, c]))

export function getDraconicColorDmgMultiplier(color: string): number {
  return DRACONIC_COLOR_MAP.get(color)?.dmgMultiplier ?? 1
}

export function getDraconicColorAttackStats(color: string): DraconicColorAttackStats | undefined {
  return DRACONIC_COLOR_MAP.get(color)
}