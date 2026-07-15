import {
  CDR_CASTER_RUNE_PCT,
  CDR_CASTER_WA_PCT,
  CDR_CHANNELED_WEAPON_BASE,
  CDR_CHANNELED_WEAPON_PER_STACK,
  CDR_MAGE_RAGE_RUNE_PCT,
  CDR_POISON_ACCEL_RUNE_PCT,
  CDR_POISON_ACCEL_WA_PCT,
  CDR_RUNIC_WINDS_RUNE_PCT,
  CDR_WAVE_RIDER_WA_PCT,
  CDR_WHIRLWIND_WA_PCT,
  CDR_WHIRLWIND_RUNE_PCT,
  CDR_GLADIATORIAL_SET_CD,
  CDR_VOLTAIC_BODY_MULT,
} from '../lib/constants'

export interface PerkCDREntry {
  runePct?: number
  waPct?: number

  runeMultiplier?: (perkAmount: number) => number
  waMultiplier?: (perkAmount: number) => number

  runeSetCD?: number
  runeFilter?: string[]
  waFilter?: string[]

  toggleable?: boolean
}

export const CDR_PERK_DATA: Record<string, PerkCDREntry> = {
  "Caster": {
    runePct: CDR_CASTER_RUNE_PCT,
    waPct: CDR_CASTER_WA_PCT,
  },
  "Channeled Weapon": {
    waMultiplier: (perkAmount) => CDR_CHANNELED_WEAPON_BASE - CDR_CHANNELED_WEAPON_PER_STACK * perkAmount,
  },
  "Mage Rage": {
    runePct: CDR_MAGE_RAGE_RUNE_PCT,
  },
  "Poison Acceleration": {
    runePct: CDR_POISON_ACCEL_RUNE_PCT,
    waPct: CDR_POISON_ACCEL_WA_PCT,
  },
  "Runic Winds": {
    runePct: CDR_RUNIC_WINDS_RUNE_PCT,
  },
  "Wave Rider": {
    waPct: CDR_WAVE_RIDER_WA_PCT,
    toggleable: true,
  },
  "Whirlwind": {
    waPct: CDR_WHIRLWIND_WA_PCT,
    runePct: CDR_WHIRLWIND_RUNE_PCT,
  },
  "Gladiatorial Rage": {
    runeSetCD: CDR_GLADIATORIAL_SET_CD,
    runeFilter: ['Rage Rune'],
  },
  "Voltaic Body": {
    runeMultiplier: (_perkAmount) => CDR_VOLTAIC_BODY_MULT,
  },
}