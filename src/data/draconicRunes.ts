export interface DraconicRunesContext {
  draconicRunesStacks: number
  draconicColor: string
}

export interface DragonInfusionContext {
  isActive: boolean
  buffPotency: number
  draconicColor: string
}

export function applyDraconicRunesBonus(
  dmgTypes: Record<string, number>,
  ctx: DraconicRunesContext
): Record<string, number> {
  const { draconicRunesStacks, draconicColor } = ctx
  
  if (draconicRunesStacks <= 0) {
    return { ...dmgTypes }
  }
  
  const bonus = 0.05 * draconicRunesStacks
  const color = draconicColor || 'physical'
  
  const result = { ...dmgTypes }
  result[color] = (result[color] ?? 0) + bonus
  
  return result
}


export function getDraconicRunesBonus(
  ctx: DraconicRunesContext
): Record<string, number> {
  const { draconicRunesStacks, draconicColor } = ctx
  
  if (draconicRunesStacks <= 0) {
    return {}
  }
  
  const bonus = 0.05 * draconicRunesStacks
  const color = draconicColor || 'physical'
  
  return { [color]: bonus }
}

export function applyDragonInfusionBonus(
  dmgTypes: Record<string, number>,
  ctx: DragonInfusionContext
): Record<string, number> {
  const { isActive, buffPotency, draconicColor } = ctx
  
  if (!isActive || buffPotency <= 0) {
    return { ...dmgTypes }
  }
  
  const bonus = buffPotency
  const color = draconicColor || 'physical'
  
  const result = { ...dmgTypes }
  result[color] = (result[color] ?? 0) + bonus
  
  return result
}

export function getDragonInfusionBonus(
  ctx: DragonInfusionContext
): Record<string, number> {
  const { isActive, buffPotency, draconicColor } = ctx
  
  if (!isActive || buffPotency <= 0) {
    return {}
  }
  
  const bonus = buffPotency
  const color = draconicColor || 'physical'
  
  return { [color]: bonus }
}

export function applyDraconicBonuses(
  dmgTypes: Record<string, number>,
  runesCtx: DraconicRunesContext,
  infusionCtx: DragonInfusionContext
): Record<string, number> {
  let result = { ...dmgTypes }
  result = applyDraconicRunesBonus(result, runesCtx)
  result = applyDragonInfusionBonus(result, infusionCtx)
  return result
}

export function getDraconicBonuses(
  runesCtx: DraconicRunesContext,
  infusionCtx: DragonInfusionContext
): Record<string, number> {
  const runesBonus = getDraconicRunesBonus(runesCtx)
  const infusionBonus = getDragonInfusionBonus(infusionCtx)
  
  const result: Record<string, number> = { ...runesBonus }
  for (const [type, bonus] of Object.entries(infusionBonus)) {
    result[type] = (result[type] ?? 0) + bonus
  }
  return result
}
