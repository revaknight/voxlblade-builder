export interface DefensivePerkSource {
  perkName: string
  drPctPerStack: number
  maxDrPct?: number
  isFlat?: boolean
  label: string
  conditionLabel: string
  hpBelowThreshold?: number
  minPerkForAlways?: number
}

export const DEFENSIVE_PERK_SOURCES: DefensivePerkSource[] = [
  {
    perkName: 'Barbskin',
    drPctPerStack: 20,
    label: 'Barbskin',
    conditionLabel: 'Khi bị Bleed (Giả định đang kích hoạt)',
  },
  {
    perkName: 'Stoneskin',
    drPctPerStack: 30,
    maxDrPct: 80,
    isFlat: true,
    label: 'Stoneskin',
    conditionLabel: 'Stoneskin lasts for the entirety of the Weapon Art animation and 50% of its cooldown after cooldown reduction effects',
  },
  {
    perkName: 'Protector Spirit',
    drPctPerStack: 20,
    isFlat: true,
    label: 'Protector Spirit',
    conditionLabel: 'Below 50% HP (or always at 2+ perk) · 3s cooldown between activations',
    hpBelowThreshold: 50,
    minPerkForAlways: 2,
  },
]

export function getActiveDefensivePerkSources(
  perks: Record<string, number>,
  hpFillPct: number = 100,
): Array<{ name: string; defPct: number; isFlat?: boolean; condition: string }> {
  const out: Array<{ name: string; defPct: number; isFlat?: boolean; condition: string }> = []
  
  for (const def of DEFENSIVE_PERK_SOURCES) {
    const amt = perks[def.perkName] ?? 0
    if (amt <= 0) continue
    if (def.hpBelowThreshold != null) {
      const bypassByPerk = def.minPerkForAlways != null && amt >= def.minPerkForAlways
      if (!bypassByPerk && hpFillPct >= def.hpBelowThreshold) continue
    }

    let defPct = def.drPctPerStack * amt
    if (def.maxDrPct != null) defPct = Math.min(defPct, def.maxDrPct)
    
    out.push({ name: def.label, defPct, isFlat: def.isFlat, condition: def.conditionLabel })
  }
  return out
}