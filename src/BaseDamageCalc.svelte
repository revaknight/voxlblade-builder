<!-- BaseDamageCalc.svelte -->
<script lang="ts">
  export let boosts: any
  export let crit: any
  export let stats: any
  export let disabledBoosts: Set<string> = new Set(['Thief Training (would-crit bonus)'])
  export let activeFinalMult: number = 1

  let baseDamage: number = 100
  let enemyDefense: number = 0
  let damageType: string = 'physical'
  let hits: number = 1

  const DMG_TYPES = [
    { id: 'physical', label: 'Physical', color: '#fb923c' },
    { id: 'magic',    label: 'Magic',    color: '#818cf8' },
    { id: 'fire',     label: 'Fire',     color: '#f97316' },
    { id: 'water',    label: 'Water',    color: '#38bdf8' },
    { id: 'earth',    label: 'Earth',    color: '#a3e635' },
    { id: 'air',      label: 'Air',      color: '#e2e8f0' },
    { id: 'hex',      label: 'Hex',      color: '#e879f9' },
    { id: 'holy',     label: 'Holy',     color: '#facc15' },
    { id: 'true',     label: 'True',     color: '#f87171' },
    { id: 'summon',   label: 'Summon',   color: '#c084fc' },
  ]

  const TYPE_BOOST_KEY: Record<string, string> = {
    physical: 'physicalBoost', magic: 'magicBoost', fire: 'fireBoost',
    water: 'waterBoost', earth: 'earthBoost', air: 'airBoost',
    hex: 'hexBoost', holy: 'holyBoost', true: '', summon: 'summonBoost',
  }

  $: typeBoostPct = (() => {
    const key = TYPE_BOOST_KEY[damageType]
    if (!key) return 0
    return (stats as Record<string, number>)[key] ?? 0
  })()
  $: typeBoostMult = 1 + typeBoostPct / 100
  $: defMult = Math.max(0, 1 - enemyDefense / 100)
  $: curType = DMG_TYPES.find(d => d.id === damageType)!

  $: rawHit  = baseDamage * typeBoostMult * activeFinalMult * defMult
  $: critHit = rawHit * (crit.critDamageMultiplier / 100)
  $: avgHit  = rawHit * (1 - crit.effectiveCritChance / 100) + critHit * (crit.effectiveCritChance / 100)
  $: totalNormal = rawHit * hits
  $: totalCrit   = critHit * hits
  $: totalAvg    = avgHit * hits

  $: breakdown = (() => {
    const steps: Array<{ label: string; mult: number; running: number; color?: string }> = []
    let running = baseDamage
    steps.push({ label: 'Base', mult: 1, running, color: '#e8e4da' })
    if (typeBoostMult !== 1) {
      running *= typeBoostMult
      steps.push({ label: `${curType.label} Boost (+${typeBoostPct}%)`, mult: typeBoostMult, running, color: curType.color })
    }
    for (const entry of boosts.dmgEntries) {
      if (disabledBoosts.has(entry.sourceName)) continue
      running *= entry.rawMultiplier
      steps.push({ label: entry.sourceName, mult: entry.rawMultiplier, running, color: entry.sourceName === 'Level Damage' ? '#fbbf24' : '#fb923c' })
    }
    if (defMult !== 1) {
      running *= defMult
      steps.push({ label: `Enemy Def ${enemyDefense}%`, mult: defMult, running, color: '#f87171' })
    }
    return steps
  })()

  function fmt(n: number): string {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M'
    if (n >= 1_000)     return (n / 1_000).toFixed(2) + 'K'
    return n.toFixed(2)
  }
</script>