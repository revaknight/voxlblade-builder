import {
  DRACONIC_FIRE_SPEED_MULT,
  DRACONIC_AIR_SPEED_MULT,
  DRACONIC_AIR_KNOCKBACK_MULT,
  DRACONIC_AIR_COOLDOWN_MULT,
  DRACONIC_EARTH_DMG_MULT,
  DRACONIC_EARTH_SPEED_MULT,
  DRACONIC_EARTH_STUN_MULT,
  DRACONIC_WATER_DMG_MULT,
  DRACONIC_WATER_SPEED_MULT,
  DRACONIC_WATER_STUN_MULT,
  DRACONIC_HEX_STUN_MULT,
  DRACONIC_HEX_RANDOM_DEBUFF_CHANCES,
} from '../lib/constants'

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
  { color: 'fire',  label: 'Red',    colorHex: '#ef4444', stat: 'fire',  speedMultiplier: DRACONIC_FIRE_SPEED_MULT, appliesBurn: true /* TODO: burn proc not modeled */ },
  { color: 'air',   label: 'White',  colorHex: '#e5e7eb', stat: 'air',   speedMultiplier: DRACONIC_AIR_SPEED_MULT, knockbackMultiplier: DRACONIC_AIR_KNOCKBACK_MULT, cooldownMultiplier: DRACONIC_AIR_COOLDOWN_MULT},
  { color: 'earth', label: 'Green',  colorHex: '#22c55e', stat: 'earth', dmgMultiplier: DRACONIC_EARTH_DMG_MULT, stunMultiplier: DRACONIC_EARTH_STUN_MULT, speedMultiplier: DRACONIC_EARTH_SPEED_MULT },
  { color: 'water', label: 'Blue',   colorHex: '#3b82f6', stat: 'water', dmgMultiplier: DRACONIC_WATER_DMG_MULT, speedMultiplier: DRACONIC_WATER_SPEED_MULT, stunMultiplier: DRACONIC_WATER_STUN_MULT, healsAndCleanses: true /* TODO: heal/cleanse not modeled */ },
  { color: 'holy',  label: 'Yellow', colorHex: '#eab308', stat: 'holy',  heals: true /* TODO: heal not modeled */ },
  { color: 'hex',   label: 'Purple', colorHex: '#a855f7', stat: 'hex',   stunMultiplier: DRACONIC_HEX_STUN_MULT, appliesWeakness: true, randomDebuffChances: DRACONIC_HEX_RANDOM_DEBUFF_CHANCES /* TODO: debuff procs not modeled */ },
]

const DRACONIC_COLOR_MAP = new Map(DRACONIC_COLOR_ATTACK_STATS.map(c => [c.color, c]))

export function getDraconicColorDmgMultiplier(color: string): number {
  return DRACONIC_COLOR_MAP.get(color)?.dmgMultiplier ?? 1
}

function getDraconicColorAttackStats(color: string): DraconicColorAttackStats | undefined {
  return DRACONIC_COLOR_MAP.get(color)
}