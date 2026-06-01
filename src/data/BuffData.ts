
export interface BuffDefinition {
  name: string
  color: string
  description: string
  effectPerTenthPotency: number
  effectUnit: '%' | 'flat'
  statKey?: string
  isDebuff?: boolean
}

export interface GrantedBuff {
  buffName: string
  potency: number
  duration: number
  condition?: string
  sourceName: string
  sourceType: 'rune' | 'ring' | 'armor' | 'weapon' | 'perk' | 'guild'
}


export const BUFF_DEFS: Record<string, BuffDefinition> = {
  'Rage': {
    name: 'Rage',
    color: '#fb923c',
    description: 'Deal more physical damage.',
    effectPerTenthPotency: 10,
    effectUnit: '%',
    statKey: 'physicalBoost',
    isDebuff: false,
  },
}


export const ITEM_BUFF_MAP: GrantedBuff[] = [
  {
    buffName: 'Rage',
    potency: 0.3,
    duration: 10,
    condition: 'On activate',
    sourceName: 'Rage Rune',
    sourceType: 'rune',
  },
]


export function getActiveBuildBuffs(build: {
  rune: string
  ring: string
  infusionRing: string
  helmet: string
  chestplate: string
  leggings: string
  weaponBlade: string
  weaponHandle: string
  monkGlove: string
}): GrantedBuff[] {
  const equippedItems = new Set([
    build.rune,
    build.ring,
    build.infusionRing,
    build.helmet,
    build.chestplate,
    build.leggings,
    build.weaponBlade,
    build.weaponHandle,
    build.monkGlove,
  ].filter(Boolean))

  return ITEM_BUFF_MAP.filter(b => equippedItems.has(b.sourceName))
}


export function calcBuffEffect(buffName: string, potency: number): {
  value: number
  unit: '%' | 'flat'
  label: string
} {
  const def = BUFF_DEFS[buffName]
  if (!def) return { value: 0, unit: '%', label: '?' }

  const tenths = Math.round(potency / 0.1)
  const value = Math.round(def.effectPerTenthPotency * tenths * 100) / 100
  const sign = def.isDebuff ? '' : '+'
  const label = def.effectUnit === '%'
    ? `${sign}${value}% ${def.description.split(' ').slice(0, 3).join(' ')}…`
    : `${sign}${value} ${def.statKey ?? ''}`

  return { value, unit: def.effectUnit, label }
}