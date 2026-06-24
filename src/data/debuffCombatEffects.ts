export interface DebuffCombatEffect {
  descFn: (potency: number) => string
  damageMult?: (potency: number) => number
  defReduction?: (potency: number) => Partial<Record<string, number>>
}

export const DEBUFF_COMBAT_EFFECTS: Record<string, DebuffCombatEffect> = {
  Weakness: {
    descFn: (p: number) => {
      const x = Math.round((1 - 1 / (1 + p)) * 10000) / 100
      return `Deal ${x}% less dmg`
    },
  },

  Shatter: {
    descFn: (p: number) => `Lose ${Math.round(p * 100)} Armor`,
    defReduction: (p: number) => ({ physical: Math.round(p * 100) }),
  },
}