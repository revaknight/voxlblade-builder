export type HealSource = 'perk' | 'rune' | 'weaponArt' | 'passive'

export interface HealScalingContext {
  perks: Record<string, number>
  emotionalState?: 'buffs' | 'debuffs' | 'both'
  inDarkness: boolean
  level?: number
  draconicColor?: string
  sliderVal?: number
}

export interface HealScalingDef {
  sourceName: string
  sourceType: HealSource
  
  // For simple heal scaling
  multiplierPerPerk?: number
  condition?: string
  isLevel?: boolean
  
  // For complex heal scaling - custom calculation function
  calcFn?: (ctx: HealScalingContext) => { multiplier: number; condition: string } | null
  
  // For heal that only applies to specific sources
  appliesTo?: HealSource[]
  
  // For conditional activation
  activeIf?: (ctx: HealScalingContext) => boolean
}

export const HEAL_SCALING_DEFS: HealScalingDef[] = [
  // Level healing
  { 
    sourceName: 'Level Healing', 
    multiplierPerPerk: 0, 
    sourceType: 'passive',
    isLevel: true,
    condition: 'LV0 → ×1.0 · LV80 → ×2.0'
  },
  
  // Simple heal boosts from perks
  { 
    sourceName: 'Emotional', 
    multiplierPerPerk: 0.20, 
    sourceType: 'perk',
    condition: 'when you have both buffs and debuffs',
    activeIf: (ctx) => ctx.emotionalState === 'both'
  },
  { 
    sourceName: 'Heal Boost', 
    multiplierPerPerk: 0.10, 
    sourceType: 'perk',
    condition: 'Increase healing by 10% per 1 of this perk'
  },
  
  // Complex heal boosts
  {
    sourceName: 'Oceans Rage',
    sourceType: 'perk',
    calcFn: (ctx) => {
      const stacks = ctx.perks['Oceans Rage'] ?? 0
      if (stacks > 0) {
        return {
          multiplier: Math.round((1 + stacks * 0.1) * 10000) / 10000,
          condition: `${stacks} stack × 10% outgoing heal`,
        }
      }
      return null
    },
  },
  {
    sourceName: 'Vampire (Sunlight)',
    sourceType: 'perk',
    calcFn: (ctx) => {
      const stacks = ctx.perks['Vampire'] ?? 0
      if (stacks > 0 && !ctx.inDarkness) {
        return { multiplier: 0.5, condition: 'Healing received halved in sunlight' }
      }
      return null
    },
  },
]

export const HEAL_SCALING_DEF_MAP = new Map(HEAL_SCALING_DEFS.map(d => [d.sourceName, d]))

export interface HealScalingResult {
  entries: Array<{
    sourceName: string
    rawMultiplier: number
    condition?: string
    sourceType: HealSource
  }>
  finalMultiplier: number
}

export function calculateHealScaling(
  ctx: HealScalingContext,
  appliesToType?: HealSource
): HealScalingResult {
  const entriesMap = new Map<string, { rawMultiplier: number; condition?: string; sourceType: HealSource }>()
  
  // Calculate level healing
  const level = ctx.level ?? 0
  const lvlMult = Math.round((1 + Math.max(0, Math.min(80, level)) / 80) * 10000) / 10000
  entriesMap.set('Level Healing', {
    rawMultiplier: lvlMult,
    condition: `LV0 → ×1.0 · LV80 → ×2.0`,
    sourceType: 'passive'
  })
  
  // Process heal scaling definitions
  for (const def of HEAL_SCALING_DEFS) {
    // Skip level healing (already handled)
    if (def.isLevel) continue
    
    // Check if applies to the requested type
    if (appliesToType && def.appliesTo && !def.appliesTo.includes(appliesToType)) {
      continue
    }
    
    // Check active condition
    if (def.activeIf && !def.activeIf(ctx)) {
      continue
    }
    
    // Complex calculation function
    if (def.calcFn) {
      const result = def.calcFn(ctx)
      if (result) {
        entriesMap.set(def.sourceName, {
          rawMultiplier: result.multiplier,
          condition: result.condition,
          sourceType: def.sourceType
        })
      }
      continue
    }
    
    // Simple perk-based multiplier
    if (def.multiplierPerPerk !== undefined) {
      const perkAmount = ctx.perks[def.sourceName] ?? 0
      if (perkAmount <= 0) continue
      
      const multiplier = 1 + def.multiplierPerPerk * perkAmount
      entriesMap.set(def.sourceName, {
        rawMultiplier: Math.round(multiplier * 10000) / 10000,
        condition: def.condition,
        sourceType: def.sourceType
      })
    }
  }
  
  const entries = Array.from(entriesMap.entries()).map(([sourceName, data]) => ({
    sourceName,
    ...data
  }))
  
  let finalMultiplier = 1.0
  for (const entry of entries) {
    finalMultiplier *= entry.rawMultiplier
  }
  
  return {
    entries,
    finalMultiplier: Math.round(finalMultiplier * 10000) / 10000
  }
}

export function getHealScalingMultiplier(
  ctx: HealScalingContext,
  appliesToType?: HealSource
): number {
  const result = calculateHealScaling(ctx, appliesToType)
  return result.finalMultiplier
}
