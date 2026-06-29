import { roundMultiplier } from './utils'

function calcDefMultiplier(defPct: number): number {
  if (!defPct) return 1
  const def = defPct / 100
  return def > 0 ? 1 / (1 + def) : 1 + Math.abs(def)
}

function calcTrueDrPercent(defPct: number): number {
  const def = defPct / 100
  return Math.round((def / (1 + Math.max(def, 0))) * 10000) / 100
}

export interface DefenseSource {
  name: string
  defPct: number
  isFlat?: boolean
  condition?: string
}

export interface ResolvedDefenseSource extends DefenseSource {
  mult: number
  trueDrPct: number
}

export interface DefenseBreakdown {
  percentSources: ResolvedDefenseSource[]
  flatSources: ResolvedDefenseSource[]
  percentMultiplier: number
  flatMultiplier: number
  finalMultiplier: number
}

export function resolveDefenseSources(sources: DefenseSource[]): DefenseBreakdown {
  const percentSources: ResolvedDefenseSource[] = []
  const flatSources: ResolvedDefenseSource[] = []

  for (const s of sources) {
    if (s.isFlat) {
      flatSources.push({ ...s, mult: roundMultiplier(1 - s.defPct / 100), trueDrPct: s.defPct })
    } else {
      percentSources.push({
        ...s,
        mult: roundMultiplier(calcDefMultiplier(s.defPct)),
        trueDrPct: calcTrueDrPercent(s.defPct),
      })
    }
  }

  let percentMultiplier = 1
  for (const s of percentSources) percentMultiplier *= s.mult
  let flatMultiplier = 1
  for (const s of flatSources) flatMultiplier *= s.mult

  return {
    percentSources,
    flatSources,
    percentMultiplier: roundMultiplier(percentMultiplier),
    flatMultiplier: roundMultiplier(flatMultiplier),
    finalMultiplier: roundMultiplier(percentMultiplier * flatMultiplier),
  }
}

export const DEF_GROUP: Record<string, string[]> = {
  physical: ['physicalDefense'],
  air:      ['airDefense', 'physicalDefense'],
  earth:    ['earthDefense', 'physicalDefense'],
  fire:     ['fireDefense', 'magicDefense'],
  water:    ['waterDefense', 'magicDefense'],
  hex:      ['hexDefense', 'magicDefense'],
  holy:     ['holyDefense', 'magicDefense'],
  magic:    ['magicDefense'],
  true:     [],
  summon:   [],
}

export function calcBaseArmorDefPct(dmgType: string, stats: Record<string, number>): number {
  const keys = DEF_GROUP[dmgType] ?? []
  let total = 0
  for (const k of keys) total += stats[k] ?? 0
  return Math.round(total * 100) / 100
}