export interface DraconicRunesContext {
  draconicRunesStacks: number
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
