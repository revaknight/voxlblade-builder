import type { StatMap } from './types'

const CRIT_DISABLED_PERKS = ['Seismic Momentum', 'Fractured Energy'] as const

const NATURAL_CRIT_SOURCES: Array<{
  label: string
  calc: (stats: StatMap, perks: Record<string, number>) => number
}> = [
  {
    label: 'Dexterity Boost',
    calc: (stats, perks) => {
      const critDisabled = CRIT_DISABLED_PERKS.some(perk => (perks[perk] ?? 0) > 0)
      if (critDisabled) return 0
      const dex = stats.dexterityBoost ?? 0
      return dex > 0 ? round(dex / 10) : 0
    },
  },
  {
    label: 'Flowing Crits (Air)',
    calc: (stats, perks) => {
      const stacks = perks['Flowing Crits'] ?? 0
      if (stacks <= 0) return 0
      const air = stats.airBoost ?? 0
      return air > 0 ? round(0.0875 * air * stacks) : 0
    },
  },
  {
    label: 'Seismic Momentum (Earth)',
    calc: (stats, perks) => {
      const stacks = perks['Seismic Momentum'] ?? 0
      if (stacks <= 0) return 0
      if ((perks['Fractured Energy'] ?? 0) > 0) return 0 
      const earth = stats.earthBoost ?? 0
      return earth > 0 ? round(0.075 * earth * stacks) : 0
    },
  },
  {
    label: 'Spell Slinger (Magic)',
    calc: (stats, perks) => {
      const stacks = perks['Spell Slinger'] ?? 0
      if (stacks <= 0) return 0
      const magic = stats.magicBoost ?? 0
      return magic > 0 ? round(0.075 * magic * stacks) : 0
    },
  },
  {
    label: 'Sharp Crits (Physical)',
    calc: (stats, perks) => {
      const stacks = perks['Sharp Crits'] ?? 0
      if (stacks <= 0) return 0
      const phys = stats.physicalBoost ?? 0
      return phys > 0 ? round(0.075 * phys * stacks) : 0
    },
  },
  {
    label: 'Perfection (max stack)',
    calc: (_stats, perks) => {
      const stacks = perks['Perfection'] ?? 0
      if (stacks <= 0) return 0
      return stacks * 5
    },
  },
]

const EXTRA_CRIT_SOURCES: Array<{
  label: string
  calc: (stats: StatMap, perks: Record<string, number>) => number
}> = [
  {
    label: 'Carrying Winds (Air) on high knockback attacks',
    calc: (stats, perks) => {
      const stacks = perks['Carrying Winds'] ?? 0
      if (stacks <= 0) return 0
      const air = stats.airBoost ?? 0
      return air > 0 ? round(air * stacks) : 0
    },
  },
  {
    label: "Caci King Spirit(King's Luck)",
    calc: (_stats, perks) => {
      const stacks = perks['Caci King Spirit'] ?? 0
      if (stacks <= 0) return 0
      return round(stacks * 20)
    },
  },
]

const CRIT_DMG_SOURCES: Array<{
  label: string
  calc: (stats: StatMap, perks: Record<string, number>) => number
}> = [
  {
    label: 'Thief Training',
    calc: (_stats, perks) => {
      const stacks = perks['Thief Training'] ?? 0
      if (stacks <= 0) return 0
      return stacks * 10 - 50
    },
  },
  {
    label: 'Dexterity Boost',
    calc: (stats, perks) => {
      if ((perks['Seismic Momentum'] ?? 0) > 0) return 0
      const dex = stats.dexterityBoost ?? 0
      return dex > 0 ? round(dex / 10) : 0
    },
  },
  {
    label: 'Flowing Crits (Air)',
    calc: (stats, perks) => {
      const stacks = perks['Flowing Crits'] ?? 0
      if (stacks <= 0) return 0
      const air = stats.airBoost ?? 0
      return air > 0 ? round(0.0875 * air * stacks) : 0
    },
  },
  {
    label: 'Seismic Momentum (Earth)',
    calc: (stats, perks) => {
      const stacks = perks['Seismic Momentum'] ?? 0
      if (stacks <= 0) return 0
      const earth = stats.earthBoost ?? 0
      return earth > 0 ? round(0.075 * earth * stacks) : 0
    },
  },
  {
    label: 'Spell Slinger (Magic)',
    calc: (stats, perks) => {
      const stacks = perks['Spell Slinger'] ?? 0
      if (stacks <= 0) return 0
      const magic = stats.magicBoost ?? 0
      return magic > 0 ? round(0.075 * magic * stacks) : 0
    },
  },
  {
    label: 'Sharp Crits (Physical)',
    calc: (stats, perks) => {
      const stacks = perks['Sharp Crits'] ?? 0
      if (stacks <= 0) return 0
      const phys = stats.physicalBoost ?? 0
      return phys > 0 ? round(0.075 * phys * stacks) : 0
    },
  },
  {
    label: 'Perfection (max stack)',
    calc: (_stats, perks) => {
      const stacks = perks['Perfection'] ?? 0
      if (stacks <= 0) return 0
      return stacks * 5
    },
  },
  {
    label: 'Venom Eater',
    calc: (_stats, perks) => {
      const stacks = perks['Venom Eater'] ?? 0
      if (stacks <= 0) return 0
      return round(-30 + stacks * 10)
    },
  },
  {
    label: 'Vital Strikes',
    calc: (_stats, perks) => {
      const stacks = perks['Vital Strikes'] ?? 0
      if (stacks <= 0) return 0
      return round(stacks * 25)
    },
  },
  {
    label: 'Spark (to burning enemies)',
    calc: (_stats, perks) => {
      const stacks = perks['Spark'] ?? 0
      if (stacks <= 0) return 0
      return round(stacks * 50)
    },
  },
  {
    label: 'Critical Master',
    calc: (_stats, perks) => {
      const stacks = perks['Critical Master'] ?? 0
      if (stacks <= 0) return 0
      return round(stacks * 5)
    },
  },
  {
    label: 'Splinter',
    calc: (_stats, perks) => {
      const stacks = perks['Splinter'] ?? 0
      if (stacks <= 0) return 0
      return round(stacks * 10)
    },
  },
]

export interface CritResult {
  naturalCritChance: number
  effectiveNaturalCrit: number
  critDamageMultiplier: number
  naturalBreakdown: Array<{ source: string; amount: number }>
  extraCritChance: number
  extraBreakdown: Array<{ source: string; amount: number }>
  allCritBreakdown: Array<{ source: string; amount: number; isExtra: boolean }>
  effectiveCritChance: number
  critFormula: string
  critDmgBreakdown: Array<{ source: string; amount: number }>
  primalActive: boolean
  primalStacks: number
}

function round(n: number): number {
  return Math.round(n * 100) / 100
}

export function calcCrit(stats: StatMap, perks: Record<string, number>): CritResult {
  const naturalBreakdown: Array<{ source: string; amount: number }> = []
  for (const src of NATURAL_CRIT_SOURCES) {
    const amount = src.calc(stats, perks)
    if (amount !== 0) naturalBreakdown.push({ source: src.label, amount })
  }
  const naturalCritChance = round(naturalBreakdown.reduce((a, b) => a + b.amount, 0))
  const primalStacks = perks['Primal'] ?? 0

  const effectiveNaturalCrit = primalStacks > 0 ? round(naturalCritChance / 4) : naturalCritChance

  const extraBreakdown: Array<{ source: string; amount: number }> = []
  for (const src of EXTRA_CRIT_SOURCES) {
    const amount = src.calc(stats, perks)
    if (amount !== 0) extraBreakdown.push({ source: src.label, amount })
  }
  const extraCritChance = round(extraBreakdown.reduce((a, b) => a + b.amount, 0))

  const chances = [
    Math.min(effectiveNaturalCrit, 100) / 100,
    ...extraBreakdown.map(src => Math.min(src.amount, 100) / 100),
  ]

  const combined = 1 - chances.reduce((acc, chance) => acc * (1 - chance), 1)
  const effectiveCritChance = round(combined * 100)

  const critFormula = '1 - ' + chances.map(v => `(1 - ${(v * 100).toFixed(2)}%)`).join(' * ')

  const displayedNaturalBreakdown = primalStacks > 0
    ? naturalBreakdown.map(s => ({ ...s, amount: round(s.amount / 4) }))
    : naturalBreakdown

  const allCritBreakdown: Array<{ source: string; amount: number; isExtra: boolean }> = [
    ...displayedNaturalBreakdown.map(s => ({ ...s, isExtra: false })),
    ...extraBreakdown.map(s => ({ ...s, isExtra: true })),
  ]

  const critDmgBreakdown: Array<{ source: string; amount: number }> = [
    { source: 'Base', amount: 150 },
  ]
  for (const src of CRIT_DMG_SOURCES) {
    const amount = src.calc(stats, perks)
    if (amount !== 0) critDmgBreakdown.push({ source: src.label, amount })
  }

  const rawCritDamageMultiplier = round(critDmgBreakdown.reduce((a, b) => a + b.amount, 0))
  const critDamageMultiplier = primalStacks > 0
    ? round(150 + (rawCritDamageMultiplier - 150) / 4)
    : rawCritDamageMultiplier

  const displayedCritDmgBreakdown: Array<{ source: string; amount: number }> = primalStacks > 0
    ? critDmgBreakdown.map(s => s.source === 'Base' ? s : { ...s, amount: round(s.amount / 4) })
    : critDmgBreakdown

  return {
    naturalCritChance,
    effectiveNaturalCrit,
    critDamageMultiplier,
    naturalBreakdown,
    extraCritChance,
    extraBreakdown,
    allCritBreakdown,
    effectiveCritChance,
    critFormula,
    critDmgBreakdown: displayedCritDmgBreakdown,
    primalActive: primalStacks > 0,
    primalStacks,
  }
}