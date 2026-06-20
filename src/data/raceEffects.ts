import type { HpGate } from './Perkbasedmg'
import { isHpGateActive } from './Perkbasedmg'

export interface RaceConditionalEffect {
  raceName: string
  hpGate: HpGate
  dmgBoostMultiplier?: number
  flatDrPct?: number
  label: string
  condition: string
}

export const RACE_CONDITIONAL_EFFECTS: RaceConditionalEffect[] = [
  {
    raceName: 'HUMAN',
    hpGate: { hpThreshold: 50, aboveThreshold: false },
    dmgBoostMultiplier: 1.2,
    flatDrPct: 20,
    label: 'Human (Below 50% HP)',
    condition: 'Race passive · active below 50% HP · flat, non-diminishing DR',
  },
]

export function getActiveRaceEffect(raceName: string, hpFillPct: number): RaceConditionalEffect | undefined {
  return RACE_CONDITIONAL_EFFECTS.find(e => e.raceName === raceName && isHpGateActive(e.hpGate, hpFillPct, 0))
}