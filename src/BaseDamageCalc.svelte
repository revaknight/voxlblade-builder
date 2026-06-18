<script lang="ts">
  import CritIcon from './CritIcon.svelte'
  export let boosts: any
  export let crit: any
  export let stats: any
  export let disabledBoosts: Set<string> = new Set(['Thief Training (would-crit bonus)'])
  export let activeFinalMult: number = 1
  export let showCritValues: boolean = false
  export let showCritToggle: boolean = false

  boosts
  disabledBoosts

  export let weaponHits: Array<{
    group: 'M1'|'M2'|'WA'; index: number; count: number
    base: number; scalingMult: number; combatMult: number; isFinisher: boolean
  }> = []
  export let rageMult: number = 1
  export let rageAffectedTypes: Set<string> = new Set()

  let baseDamage = 0
  let damageType = 'physical'
  let hits = 1
  let selectedHit: typeof weaponHits[0] | null = null
  let hasAutoSelected = false

  $: if (!hasAutoSelected && weaponHits.length > 0) {
    selectHit(weaponHits[0])
    hasAutoSelected = true
  }

  const DMG_TYPES = [
    { id: 'physical', label: 'Physical', color: '#fb923c' },
    { id: 'magic',    label: 'Magic',    color: '#818cf8' },
    { id: 'fire',     label: 'Fire',     color: '#f97316' },
    { id: 'water',    label: 'Water',    color: '#38bdf8' },
    { id: 'earth',    label: 'Earth',    color: '#a3e635' },
    { id: 'air',      label: 'Air',      color: '#AAFFDB' },
    { id: 'hex',      label: 'Hex',      color: '#e879f9' },
    { id: 'holy',     label: 'Holy',     color: '#facc15' },
    { id: 'true',     label: 'True',     color: '#f87171' },
    { id: 'summon',   label: 'Summon',   color: '#c084fc' },
  ]
  const DMG_TYPE_MAP = new Map(DMG_TYPES.map(t => [t.id, t]))
  $: curType = DMG_TYPE_MAP.get(damageType) ?? DMG_TYPES[0]

  const DEF_TYPE_IDS = ['physical','magic','fire','water','earth','air','hex','holy']
  let defenses: Record<string, number> = Object.fromEntries(DEF_TYPE_IDS.map(t => [t, 0]))

  // ── Hit selection ──────────────────────────────────────────────────────────
  function selectHit(hit: typeof weaponHits[0]) {
    if (selectedHit === hit) { selectedHit = null; return }
    selectedHit = hit
    baseDamage = hit.base
  }

  // If user manually edits baseDamage, clear hit selection
  function onBaseDmgInput(e: Event) {
    baseDamage = parseFloat((e.target as HTMLInputElement).value) || 0
    selectedHit = null
  }

  // ── Effective mults ────────────────────────────────────────────────────────
  $: effectiveScalingMult = selectedHit ? selectedHit.scalingMult : 1
  $: effectiveCombatMult  = selectedHit ? selectedHit.combatMult  : activeFinalMult
  $: effectiveRageMult    = rageMult > 1 && rageAffectedTypes.has(damageType) ? rageMult : 1

  // ── Stat boosts ───────────────────────────────────────────────────────────
  $: typeBoostPct = (() => {
    if (damageType === 'true' || damageType === 'summon') return 0
    return (stats as any)?.[`${damageType}Boost`] ?? 0
  })()
  $: typeBoostMult = Math.round((1 + typeBoostPct / 100) * 10000) / 10000

  // ── Armor pen ─────────────────────────────────────────────────────────────
  $: armorPen   = (stats as any)?.armorPenetration ?? 0
  $: penDecimal = armorPen / 100

  function calcArmorMult(defPct: number, pen: number): { mult: number; branch: 'low'|'high' } {
    const def = defPct / 100
    if (def <= pen + 0.2) {
      const am = def - pen
      return { mult: am > 0 ? 1 / (1 + am) : 1 - am, branch: 'low' }
    } else {
      const am = def / (1 + 5 * pen)
      return { mult: 1 / (1 + am), branch: 'high' }
    }
  }

  $: enemyDefPct = (damageType === 'true' || damageType === 'summon') ? 0 : (defenses[damageType] ?? 0)
  $: armorCalc  = calcArmorMult(enemyDefPct, penDecimal)
  $: defMult    = Math.round(armorCalc.mult * 10000) / 10000

  // ── Final damage ──────────────────────────────────────────────────────────
  $: rawHit    = Math.round(baseDamage * effectiveScalingMult * typeBoostMult * effectiveRageMult * effectiveCombatMult * defMult * 100) / 100
  $: critHit   = Math.round(rawHit * (crit?.critDamageMultiplier ?? 100) / 100 * 100) / 100
  $: critChance = crit?.effectiveCritChance ?? 0
  $: avgHit    = Math.round((rawHit * (1 - critChance / 100) + critHit * (critChance / 100)) * 100) / 100
  $: totalRaw  = Math.round(rawHit * hits * 100) / 100
  $: totalAvg  = Math.round(avgHit * hits * 100) / 100

  $: m1Hits = weaponHits.filter(h => h.group === 'M1')
  $: m2Hits = weaponHits.filter(h => h.group === 'M2')
  $: waHits = weaponHits.filter(h => h.group === 'WA')

  $: hitGroups = [
    { label: 'M1', list: m1Hits },
    { label: 'M2', list: m2Hits },
    { label: 'WA', list: waHits }
  ]

  function fmt(n: number) {
    const r = Math.round(n * 100) / 100
    return Number.isInteger(r) ? String(r) : r.toFixed(2).replace(/\.?0+$/, '')
  }
</script>

<div class="bdc-root da-section">
  <div class="da-section-title">Damage Calculator</div>

  <div class="bdc-layout">

    <div class="bdc-dummy-col">
      <div class="bdc-dummy-wrap">
        <svg viewBox="0 0 54 67" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges" class="bdc-svg">
          <defs>
            <linearGradient id="bdc-khaki" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#d4b35e"/>
              <stop offset="100%" stop-color="#b3924a"/>
            </linearGradient>
            <linearGradient id="bdc-armGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stop-color="#8a6f56"/>
              <stop offset="50%" stop-color="#f0935f"/>
              <stop offset="100%" stop-color="#8a6f56"/>
            </linearGradient>
            <linearGradient id="bdc-torsoGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#c7a657"/>
              <stop offset="100%" stop-color="#a98c4c"/>
            </linearGradient>
          </defs>
          <rect x="11" y="57" width="32" height="10" fill="url(#bdc-khaki)" stroke="#1a1208" stroke-width="1.2"/>
          <rect x="21" y="47" width="12" height="11" fill="#7a5f47" stroke="#1a1208" stroke-width="1.2"/>
          <rect x="0"  y="19" width="54" height="9"  fill="url(#bdc-armGrad)" stroke="#1a1208" stroke-width="1.2"/>
          <rect x="11" y="17" width="32" height="2"  fill="#8a6f56" stroke="#1a1208" stroke-width="1"/>
          <rect x="17" y="17" width="20" height="31" fill="url(#bdc-torsoGrad)" stroke="#1a1208" stroke-width="1.2"/>
          <rect x="17" y="13" width="20" height="4"  fill="#6b6256" stroke="#1a1208" stroke-width="1"/>
          <rect x="19" y="0"  width="16" height="14" fill="url(#bdc-khaki)" stroke="#1a1208" stroke-width="1.2"/>
          <rect x="19" y="26" width="16" height="16" fill="#c81d10" stroke="#1a1208" stroke-width="0.8"/>
          <rect x="22.5" y="29.5" width="9" height="9" fill="#ffe3da"/>
          <rect x="25"   y="32"   width="4" height="4" fill="#8e2418"/>
        </svg>

        <div class="bdc-dummy-label">Training Dummy</div>
        <div class="bdc-no-hp">∞ No HP</div>
        {#if armorPen > 0}
          <div class="bdc-pen-badge">🗡 {fmt(armorPen)} Pen</div>
        {/if}
      </div>

      <div class="bdc-def-grid">
        {#each DMG_TYPES.filter(t => t.id !== 'true' && t.id !== 'summon') as t}
          {@const active = damageType === t.id}
          <button
            class="bdc-def-row"
            class:bdc-def-row--active={active}
            style="--tc:{t.color}"
            on:click={() => damageType = t.id}
          >
            <span class="bdc-def-type">{t.label}</span>
            <input
              class="bdc-def-input"
              type="number"
              min="-200"
              max="1000"
              step="1"
              value={defenses[t.id]}
              on:input={e => { defenses[t.id] = parseFloat((e.target as HTMLInputElement).value) || 0 }}
              on:click|stopPropagation
            />
            <span class="bdc-def-pct">%</span>
          </button>
        {/each}
      </div>
    </div>

    <div class="bdc-calc-col">
      {#if weaponHits.length > 0}
        <div class="bdc-hit-sel">
          {#each hitGroups as grp}
            {#if grp.list.length > 0}
              <div class="bdc-hit-grp">
                <span class="bdc-hit-grp-label">{grp.label}</span>
                {#each grp.list as hit, i}
                  <button
                    class="bdc-hit-btn"
                    class:bdc-hit-btn--active={selectedHit === hit}
                    class:bdc-hit-btn--finisher={hit.isFinisher}
                    on:click={() => selectHit(hit)}
                  >
                    {fmt(hit.base)}
                    {#if hit.count > 1}<span class="bdc-hit-cnt">×{hit.count}</span>{/if}
                    {#if hit.isFinisher}<span class="bdc-hit-fin">✦</span>{/if}
                  </button>
                {/each}
              </div>
            {/if}
          {/each}
          {#if selectedHit}
            <button class="bdc-hit-clear" on:click={() => selectedHit = null}>✕ manual</button>
          {/if}
        </div>
      {/if}

      <div class="bdc-type-row">
        {#each DMG_TYPES as t}
          <button
            class="bdc-type-btn"
            class:bdc-type-btn--active={damageType === t.id}
            style="--tc:{t.color}"
            on:click={() => damageType = t.id}
          >{t.label}</button>
        {/each}
      </div>

      {#if showCritToggle}
        <div class="bdc-crit-toggle-row">
          <button
            class="bdc-crit-toggle"
            class:bdc-crit-toggle--on={showCritValues}
            on:click={() => showCritValues = !showCritValues}
          >
            <CritIcon size={12}/> {showCritValues ? 'Crit ON' : 'Crit OFF'}
          </button>
        </div>
      {/if}

      <div class="bdc-chain">
        <div class="bdc-chain-row">
          <span class="bdc-chain-base">{fmt(baseDamage)}</span>
          
          {#if effectiveScalingMult !== 1}
            <span class="bdc-chain-op">×</span>
            <div class="bdc-chain-chip bdc-chain-chip--scaling">
              <span class="bdc-chip-name">Scaling</span>
              <span class="bdc-chip-val">×{fmt(effectiveScalingMult)}</span>
            </div>
          {/if}

          {#if effectiveRageMult !== 1}
            <span class="bdc-chain-op">×</span>
            <div class="bdc-chain-chip bdc-chain-chip--rage">
              <span class="bdc-chip-name">🔥 Rage</span>
              <span class="bdc-chip-val">×{fmt(effectiveRageMult)}</span>
            </div>
          {/if}

          {#if typeBoostMult !== 1}
            <span class="bdc-chain-op">×</span>
            <div class="bdc-chain-chip" style="--tc:{curType.color}">
              <span class="bdc-chip-name">{curType.label} Boost</span>
              <span class="bdc-chip-val">×{fmt(typeBoostMult)}</span>
              <span class="bdc-chip-sub">+{fmt(typeBoostPct)}%</span>
            </div>
          {/if}

          <span class="bdc-chain-op">×</span>
          <div class="bdc-chain-chip bdc-chain-chip--combat">
            <span class="bdc-chip-name">Combat</span>
            <span class="bdc-chip-val">×{fmt(effectiveCombatMult)}</span>
          </div>

          {#if defMult !== 1}
            <span class="bdc-chain-op">×</span>
            <div class="bdc-chain-chip bdc-chain-chip--def" class:bdc-chain-chip--amplify={defMult > 1}>
              <span class="bdc-chip-name">
                {defMult > 1 ? '⬆ Neg.Def' : '⬇ Defense'}
              </span>
              <span class="bdc-chip-val">×{fmt(defMult)}</span>
              {#if armorPen > 0}
                <span class="bdc-chip-sub">pen {fmt(armorPen)}</span>
              {/if}
            </div>
          {:else if armorPen > 0 && enemyDefPct === 0}
            <span class="bdc-chain-op">×</span>
            <div class="bdc-chain-chip bdc-chain-chip--amplify">
              <span class="bdc-chip-name">⬆ Pen Bonus</span>
              <span class="bdc-chip-val">×{fmt(defMult)}</span>
              <span class="bdc-chip-sub">def=0, pen={fmt(armorPen)}</span>
            </div>
          {/if}

          <span class="bdc-chain-op">×</span>
          <div class="bdc-chain-chip bdc-chain-chip--amplify">
            <span class="bdc-chip-name">⬆ Pen Bonus</span>
            <span class="bdc-chip-val">×{fmt(defMult)}</span>
            <span class="bdc-chip-sub">def=0, pen={fmt(armorPen)}</span>
          </div>
          
          <span class="bdc-chain-eq">=</span>
          <span class="bdc-chain-result" style="--tc:{curType.color}">{fmt(rawHit)}</span>
        </div>
      </div>

      <div class="bdc-results">
        <div class="bdc-result-card">
          <span class="bdc-result-label">Per Hit</span>
          <span class="bdc-result-val" style="color:{curType.color}">{fmt(rawHit)}</span>
        </div>
        {#if critChance > 0 && showCritValues}
          <div class="bdc-result-card bdc-result-card--crit">
            <span class="bdc-result-label">✦ Crit Hit</span>
            <span class="bdc-result-val" style="color:#e2b203">{fmt(critHit)}</span>
          </div>
          <div class="bdc-result-card bdc-result-card--avg">
            <span class="bdc-result-label">~ Avg Hit</span>
            <span class="bdc-result-val" style="color:#a78bfa">{fmt(avgHit)}</span>
          </div>
        {/if}
        {#if hits > 1}
          <div class="bdc-result-card bdc-result-card--total">
            <span class="bdc-result-label">×{hits} Total</span>
            <span class="bdc-result-val" style="color:{curType.color}">{fmt(critChance > 0 && showCritValues ? totalAvg : totalRaw)}</span>
            {#if critChance > 0 && showCritValues}
              <span class="bdc-result-sub">{fmt(totalRaw)} raw</span>
            {/if}
          </div>
        {/if}
      </div>

    </div>
  </div>
</div>

<style>
.bdc-root {
  border-color: rgba(204,153,88,.2) !important;
  background: linear-gradient(160deg, var(--surface, #141715) 60%, rgba(204,153,88,.04) 100%) !important;
}

.bdc-layout {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

/* ── Dummy column ── */
.bdc-dummy-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.bdc-dummy-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.bdc-svg {
  width: 72px;
  height: auto;
  image-rendering: pixelated;
  filter: drop-shadow(0 0 8px rgba(201,29,16,.25));
}

.bdc-dummy-label {
  font-size: .6rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .14em;
  color: #b3924a;
  opacity: .8;
}

.bdc-no-hp {
  font-size: .58rem;
  font-weight: 700;
  padding: 1px 8px;
  border-radius: 999px;
  background: rgba(248,113,113,.1);
  border: 1px solid rgba(248,113,113,.2);
  color: #f87171;
  letter-spacing: .08em;
}

.bdc-pen-badge {
  font-size: .6rem;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(229,229,229,.1);
  border: 1px solid rgba(229,229,229,.25);
  color: #e5e5e5;
  letter-spacing: .06em;
  white-space: nowrap;
}

/* Defense grid */
.bdc-def-grid {
  display: flex;
  flex-direction: column;
  gap: 3px;
  width: 100%;
}

.bdc-def-row {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 8px;
  border-radius: 6px;
  background: var(--surface2, #1a1d1b);
  border: 1px solid transparent;
  cursor: pointer;
  font-family: inherit;
  transition: background .1s, border-color .1s;
  width: 100%;
  min-width: 140px;
}
.bdc-def-row:hover { background: var(--surface3, #212420); }
.bdc-def-row--active {
  border-color: color-mix(in srgb, var(--tc) 40%, transparent);
  background: color-mix(in srgb, var(--tc) 7%, transparent);
}

.bdc-def-type {
  font-size: .62rem;
  font-weight: 700;
  color: var(--tc, #e8e4da);
  width: 50px;
  text-align: left;
  flex-shrink: 0;
}

.bdc-def-input {
  font-family: 'Courier New', monospace;
  font-size: .82rem;
  font-weight: 700;
  color: var(--ink, #e8e4da);
  background: rgba(255,255,255,.05);
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 4px;
  width: 52px;
  text-align: right;
  padding: 1px 4px;
  -moz-appearance: textfield;
  appearance: textfield;
  flex-shrink: 0;
}
.bdc-def-input::-webkit-inner-spin-button,
.bdc-def-input::-webkit-outer-spin-button { -webkit-appearance: none; }
.bdc-def-input:focus { outline: none; border-color: var(--tc, rgba(255,255,255,.25)); }

.bdc-def-pct {
  font-size: .65rem;
  color: var(--ink-muted, #8a8d85);
  opacity: .5;
}

/* ── Calc column ── */
.bdc-calc-col {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}


/* Type selector */
.bdc-type-row {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.bdc-type-btn {
  font-size: .6rem;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 6px;
  border: 1px solid rgba(255,255,255,.08);
  background: var(--surface2, #1a1d1b);
  color: var(--ink-muted, #8a8d85);
  cursor: pointer;
  font-family: inherit;
  transition: all .1s;
}
.bdc-type-btn:hover { border-color: var(--tc); color: var(--tc); }
.bdc-type-btn--active {
  background: color-mix(in srgb, var(--tc) 15%, transparent);
  border-color: var(--tc);
  color: var(--tc);
  font-weight: 800;
}

/* Crit Toggle Row */
.bdc-crit-toggle-row {
  display: flex;
  justify-content: flex-end;
}
.bdc-crit-toggle {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: .62rem;
  font-weight: 800;
  padding: 3px 10px;
  border-radius: 6px;
  border: 1px solid rgba(226,178,3,.25);
  background: var(--surface2, #1a1d1b);
  color: var(--ink-muted, #8a8d85);
  cursor: pointer;
  font-family: inherit;
  transition: all .12s;
}
.bdc-crit-toggle--on {
  border-color: rgba(226,178,3,.6);
  background: rgba(226,178,3,.12);
  color: #e2b203;
  box-shadow: 0 0 8px rgba(226,178,3,.2);
}

/* Multiplier chain */
.bdc-chain {
  background: var(--surface2, #1a1d1b);
  border: 1px solid rgba(255,255,255,.06);
  border-radius: 8px;
  padding: 8px 12px;
}

.bdc-chain-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 5px;
}

.bdc-chain-base {
  font-family: 'Courier New', monospace;
  font-size: .95rem;
  font-weight: 700;
  color: var(--ink-muted, #8a8d85);
}

.bdc-chain-op {
  font-size: .7rem;
  color: var(--ink-muted, #8a8d85);
  opacity: .4;
}

.bdc-chain-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3px 9px;
  border-radius: 7px;
  background: rgba(251,146,60,.08);
  border: 1px solid rgba(251,146,60,.22);
}
.bdc-chain-chip--combat {
  background: rgba(52,211,153,.07);
  border-color: rgba(52,211,153,.2);
}
.bdc-chain-chip--def {
  background: rgba(248,113,113,.07);
  border-color: rgba(248,113,113,.2);
}
.bdc-chain-chip--amplify {
  background: rgba(251,191,36,.07);
  border-color: rgba(251,191,36,.22);
}

.bdc-chip-name {
  font-size: .52rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .1em;
  color: var(--ink-muted, #8a8d85);
  opacity: .7;
}
.bdc-chip-val {
  font-family: 'Courier New', monospace;
  font-size: .88rem;
  font-weight: 800;
  color: #fb923c;
}
.bdc-chain-chip--combat .bdc-chip-val { color: #34d399; }
.bdc-chain-chip--def    .bdc-chip-val { color: #f87171; }
.bdc-chain-chip--amplify .bdc-chip-val { color: #fbbf24; }

.bdc-chip-sub {
  font-size: .5rem;
  color: var(--ink-muted, #8a8d85);
  opacity: .55;
  font-style: italic;
}

.bdc-chain-eq {
  font-size: .85rem;
  font-weight: 900;
  color: var(--ink-muted, #8a8d85);
  margin: 0 2px;
}

.bdc-chain-result {
  font-family: 'Courier New', monospace;
  font-size: 1.2rem;
  font-weight: 900;
  color: var(--tc, #e8e4da);
  text-shadow: 0 0 12px color-mix(in srgb, var(--tc, #e8e4da) 50%, transparent);
}

/* Results */
.bdc-results {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.bdc-result-card {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 14px;
  border-radius: 9px;
  background: var(--surface2, #1a1d1b);
  border: 1px solid rgba(255,255,255,.07);
  min-width: 80px;
}
.bdc-result-card--crit {
  background: rgba(226,178,3,.06);
  border-color: rgba(226,178,3,.2);
}
.bdc-result-card--avg {
  background: rgba(167,139,250,.06);
  border-color: rgba(167,139,250,.2);
}
.bdc-result-card--total {
  background: rgba(52,211,153,.06);
  border-color: rgba(52,211,153,.2);
}

.bdc-result-label {
  font-size: .55rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .14em;
  color: var(--ink-muted, #8a8d85);
  opacity: .65;
}
.bdc-result-val {
  font-family: 'Courier New', monospace;
  font-size: 1.35rem;
  font-weight: 900;
  line-height: 1;
  text-shadow: 0 0 14px color-mix(in srgb, currentColor 50%, transparent);
}
.bdc-result-sub {
  font-size: .58rem;
  color: var(--ink-muted, #8a8d85);
  opacity: .5;
  font-family: 'Courier New', monospace;
}

@media (max-width: 600px) {
  .bdc-layout { flex-direction: column; }
  .bdc-dummy-col { flex-direction: row; align-items: flex-start; width: 100%; }
  .bdc-dummy-wrap { flex-shrink: 0; }
  .bdc-def-grid { flex: 1; }
}

/* ── Hit selector ── */
.bdc-hit-sel {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  padding: 7px 10px;
  border-radius: 7px;
  background: rgba(255,255,255,.03);
  border: 1px solid rgba(255,255,255,.06);
}
.bdc-hit-grp {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}
.bdc-hit-grp-label {
  font-size: .52rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: .14em;
  color: var(--ink-muted, #8a8d85);
  opacity: .5;
  min-width: 20px;
}
.bdc-hit-btn {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 3px 8px;
  border-radius: 5px;
  border: 1px solid rgba(255,255,255,.1);
  background: var(--surface2, #1a1d1b);
  color: var(--ink-muted, #8a8d85);
  font-size: .75rem;
  font-weight: 700;
  font-family: 'Courier New', monospace;
  cursor: pointer;
  transition: all .1s;
}
.bdc-hit-btn:hover { border-color: rgba(251,146,60,.4); color: #fb923c; }
.bdc-hit-btn--active {
  background: rgba(251,146,60,.15);
  border-color: rgba(251,146,60,.5);
  color: #fb923c;
  box-shadow: 0 0 6px rgba(251,146,60,.25);
}
.bdc-hit-btn--finisher {
  border-color: rgba(250,204,21,.25);
}
.bdc-hit-btn--finisher.bdc-hit-btn--active {
  background: rgba(250,204,21,.12);
  border-color: rgba(250,204,21,.5);
  color: #facc15;
}
.bdc-hit-cnt { font-size: .58rem; opacity: .6; }
.bdc-hit-fin { font-size: .65rem; color: #facc15; }
.bdc-hit-clear {
  font-size: .58rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px solid rgba(248,113,113,.25);
  background: rgba(248,113,113,.07);
  color: #f87171;
  cursor: pointer;
  font-family: inherit;
  transition: all .1s;
  margin-left: auto;
}
.bdc-hit-clear:hover { background: rgba(248,113,113,.18); }

/* chain chips */
.bdc-chain-chip--scaling {
  background: rgba(52,211,153,.07);
  border-color: rgba(52,211,153,.2);
}
.bdc-chain-chip--scaling .bdc-chip-val { color: #34d399; }
.bdc-chain-chip--rage {
  background: rgba(247,2,1,.07);
  border-color: rgba(247,2,1,.25);
}
.bdc-chain-chip--rage .bdc-chip-val { color: #f70201; }
</style>