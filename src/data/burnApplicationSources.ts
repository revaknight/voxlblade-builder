export interface BurnCapability {
  global: boolean
  wa: boolean
  rune: boolean
  perkTags: Set<string>
}

export function resolveBurnCapability(
  perks: Record<string, number>,
  selectedWA: string,
  runeName: string,
  race: string,
  draconicGuild: boolean,
  draconicInfusionActive: boolean,
  draconicColor: string,
): BurnCapability {
  const bc: BurnCapability = { global: false, wa: false, rune: false, perkTags: new Set() }

  // Global: any hit can apply Burn
  if (perks['Ignition'] > 0) bc.global = true
  if (perks['Exhaust'] > 0) bc.global = true
  if (perks['Bellowing Ember'] > 0) bc.global = true
  if (perks['Echo Incineration'] > 0) bc.global = true
  if (perks['Sunburn'] > 0) bc.global = true
  if (perks['Pyre Bloom'] > 0) bc.global = true

  // Dark Elf: 8% chance on hit
  if (race === 'DARK ELF') bc.global = true

  // Draconic Infusion Fire: on hit (proc-affected)
  if (draconicGuild && draconicInfusionActive && draconicColor === 'fire') bc.global = true

  // Draconic Color Fire innate: all attacks apply Burn
  if (draconicGuild && draconicColor === 'fire') bc.global = true

  // WA scope: specific weapon arts apply Burn
  const burnWAs = new Set([
    'Flame Slash',
    'Cursed Ground',
    'Wild Bolt',
    'Fiery Pursuit',
    'Laser',
  ])
  if (burnWAs.has(selectedWA)) bc.wa = true

  // Draconic ability Fire: Dragon Claw / Dragon Bubble
  if (draconicGuild && draconicColor === 'fire') {
    const ability = draconicInfusionActive
    if (ability && (selectedWA.includes('Claw') || selectedWA.includes('Bubble') || selectedWA.includes('Dragon'))) {
      bc.wa = true
    }
  }

  // Rune scope: runes that apply Burn on cast
  const burnRunes = new Set(['Fireball Rune', 'Brainblast Rune'])
  if (burnRunes.has(runeName)) bc.rune = true

  // Perk tag scope: specific perk on-hit entries that apply Burn
  if (perks['Dragon Breath'] > 0) bc.perkTags.add('Dragon Breath')

  return bc
}
