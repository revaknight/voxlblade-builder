<script lang="ts">
  import { onMount, onDestroy } from 'svelte'

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
    { id: 'summon',   label: 'Summon',   color: '#a78bfa' },
  ]

  const DMG_TYPE_MAP = new Map(DMG_TYPES.map(t => [t.id, t]))

  $: curType = DMG_TYPE_MAP.get(damageType) ?? DMG_TYPES[0]

  $: typeBoostPct = (() => {
    if (!boosts?.multipliers) return 0
    const key = damageType === 'true' ? 'trueDamageBoost' : `${damageType}Boost`
    return boosts.multipliers[key] ?? 0
  })()

  $: typeBoostMult = 1 + typeBoostPct / 100

  $: defMult = (() => {
    const defKey = damageType === 'true' ? '' : `${damageType}Defense`
    if (!defKey || !stats?.[defKey]) return 1
    const enemyDef = Math.max(0, enemyDefense - (stats.shred ?? 0))
    return Math.max(0.1, 1 - enemyDef / 100)
  })()

  $: rawHit  = baseDamage * typeBoostMult * activeFinalMult * defMult
  $: critHit = rawHit * (crit.critDamageMultiplier / 100)
  $: avgHit  = rawHit * (1 - crit.effectiveCritChance / 100) + critHit * (crit.effectiveCritChance / 100)

  $: breakdown = (() => {
    const steps: Array<{ label: string; mult: number; running: number; color?: string }> = []
    let running = baseDamage
    steps.push({ label: 'Base', mult: 1, running, color: '#e8e4da' })
    
    if (typeBoostMult !== 1) {
      running *= typeBoostMult
      steps.push({ label: `${curType.label} Boost (+${typeBoostPct}%)`, mult: typeBoostMult, running, color: curType.color })
    }
    
    if (boosts?.dmgEntries) {
      for (const entry of boosts.dmgEntries) {
        if (disabledBoosts.has(entry.sourceName)) continue
        running *= entry.rawMultiplier
        steps.push({ 
          label: entry.sourceName, 
          mult: entry.rawMultiplier, 
          running, 
          color: entry.sourceName === 'Level Damage' ? '#fbbf24' : '#fb923c' 
        })
      }
    }
    
    if (defMult !== 1) {
      running *= defMult
      steps.push({ label: `Enemy Def (${enemyDefense})`, mult: defMult, running, color: '#ef4444' })
    }
    
    if (activeFinalMult !== 1) {
      running *= activeFinalMult
      steps.push({ label: 'Global Final Mult', mult: activeFinalMult, running, color: '#a78bfa' })
    }
    return steps
  })()
  function setupInputScroll(node: HTMLInputElement, callback: (delta: number) => void) {
    const handleWheel = (e: WheelEvent) => {
      if (document.activeElement === node) {
        e.preventDefault()
        const delta = e.deltaY < 0 ? 1 : -1
        callback(delta)
      }
    }
    node.addEventListener('wheel', handleWheel, { passive: false })
    return {
      destroy() {
        node.removeEventListener('wheel', handleWheel)
      }
    }
  }

  function handleTypeKeyDown(e: KeyboardEvent, id: string) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      damageType = id
    }
  }
</script>