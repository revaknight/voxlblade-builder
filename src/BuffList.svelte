<script lang="ts">
  import { build } from './lib/store'
  import {
    BUFF_DEFS,
    ITEM_BUFF_MAP,
    getActiveBuildBuffs,
    calcBuffEffect,
    type GrantedBuff,
  } from './data/BuffData'

  $: activeBuffs = getActiveBuildBuffs({
    rune: $build.rune,
    ring: $build.ring,
    infusionRing: $build.infusionRing,
    helmet: $build.helmet,
    chestplate: $build.chestplate,
    leggings: $build.leggings,
    weaponBlade: $build.weaponBlade,
    weaponHandle: $build.weaponHandle,
    monkGlove: $build.monkGlove,
  })

  $: buffs   = activeBuffs.filter(b => !BUFF_DEFS[b.buffName]?.isDebuff)
  $: debuffs = activeBuffs.filter(b =>  BUFF_DEFS[b.buffName]?.isDebuff)

  // ── UI state ──────────────────────────────────────────────────────────────
  let expanded = true
  let activeTab: 'buffs' | 'debuffs' = 'buffs'

  // ── Source type badge color ───────────────────────────────────────────────
  const SRC_COLOR: Record<string, string> = {
    rune:   '#a78bfa',
    ring:   '#38bdf8',
    armor:  '#4ade80',
    weapon: '#fb923c',
    perk:   '#fbbf24',
    guild:  '#e879f9',
  }

  const SRC_LABEL: Record<string, string> = {
    rune: 'Rune', ring: 'Ring', armor: 'Armor',
    weapon: 'Weapon', perk: 'Perk', guild: 'Guild',
  }
</script>

<div class="bl-root">
  <!-- ── Header ── -->
  <div class="bl-header">
    <div class="bl-tabs">
      <button
        class="bl-tab"
        class:bl-tab--active={activeTab === 'buffs'}
        on:click={() => { activeTab = 'buffs'; expanded = true }}
      >
        <span class="bl-tab-dot bl-tab-dot--buff"></span>
        Buffs
        {#if buffs.length > 0}
          <span class="bl-count bl-count--buff">{buffs.length}</span>
        {/if}
      </button>
      <button
        class="bl-tab"
        class:bl-tab--active={activeTab === 'debuffs'}
        on:click={() => { activeTab = 'debuffs'; expanded = true }}
      >
        <span class="bl-tab-dot bl-tab-dot--debuff"></span>
        Debuffs Applied
        {#if debuffs.length > 0}
          <span class="bl-count bl-count--debuff">{debuffs.length}</span>
        {/if}
      </button>
    </div>
    <button class="bl-collapse" on:click={() => expanded = !expanded}>
      {expanded ? '▲' : '▼'}
    </button>
  </div>

  {#if expanded}
    {@const list = activeTab === 'buffs' ? buffs : debuffs}
    {#if list.length === 0}
      <div class="bl-empty">
        <span class="bl-empty-icon">{activeTab === 'buffs' ? '✦' : '☠'}</span>
        <span class="bl-empty-text">
          No {activeTab === 'buffs' ? 'buff-granting' : 'debuff-applying'} items equipped.
        </span>
      </div>
    {:else}
      <div class="bl-list">
        {#each list as granted (granted.sourceName + granted.buffName)}
          {@const def = BUFF_DEFS[granted.buffName]}
          {@const effect = calcBuffEffect(granted.buffName, granted.potency)}
          {#if def}
            <div
              class="bl-card"
              class:bl-card--debuff={def.isDebuff}
              style="--c:{def.color}"
            >

              <!-- Center: info -->
              <div class="bl-info">
                <div class="bl-info-top">
                  <span class="bl-buff-name" style="color:{def.color}">{def.name}</span>
                  {#if granted.duration > 0}
                    <span class="bl-duration">⏱ {granted.duration}s</span>
                  {:else}
                    <span class="bl-duration bl-duration--passive">Passive</span>
                  {/if}
                </div>
                <div class="bl-effect">
                  <span class="bl-potency">
                    {granted.potency} potency
                  </span>
                  <span class="bl-arrow">→</span>
                  <span class="bl-value" style="color:{def.color}">
                    {effect.value}{effect.unit === '%' ? '%' : ''}
                    {def.isDebuff ? ' to enemy' : ''}
                  </span>
                </div>
                <div class="bl-desc">{def.description}</div>
                {#if granted.condition}
                  <div class="bl-condition">
                    <span class="bl-cond-dot"></span>
                    {granted.condition}
                  </div>
                {/if}
              </div>

              <!-- Right: source badge -->
              <div class="bl-source">
                <span class="bl-src-type"
                  style="color:{SRC_COLOR[granted.sourceType]};background:color-mix(in srgb,{SRC_COLOR[granted.sourceType]} 12%,transparent);border-color:color-mix(in srgb,{SRC_COLOR[granted.sourceType]} 25%,transparent)">
                  {SRC_LABEL[granted.sourceType]}
                </span>
                <span class="bl-src-name">{granted.sourceName}</span>
              </div>
            </div>
          {/if}
        {/each}
      </div>

      <!-- ── Scaling legend ── -->
      <div class="bl-legend">
        <span class="bl-leg-icon">ℹ</span>
        Each 0.1 potency = {
          [...new Set(list.map(b => {
            const d = BUFF_DEFS[b.buffName]
            return d ? `${d.effectPerTenthPotency}${d.effectUnit} (${b.buffName})` : null
          }).filter(Boolean))].join(' · ')
        }
      </div>
    {/if}
  {/if}
</div>

<style>
  .bl-root {
    background: var(--surface, #141715);
    border: 1px solid rgba(255,255,255,.06);
    border-radius: 12px;
    overflow: hidden;
    font-family: var(--font-body, 'Trebuchet MS', sans-serif);
  }

  /* ── Header ── */
  .bl-header {
    display: flex;
    align-items: stretch;
    border-bottom: 1px solid rgba(255,255,255,.06);
    background: var(--surface2, #1a1d1b);
  }
  .bl-tabs {
    display: flex;
    flex: 1;
  }
  .bl-tab {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 16px;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    margin-bottom: -1px;
    color: var(--ink-muted, #8a8d85);
    font-size: .72rem;
    font-weight: 700;
    letter-spacing: .08em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all .15s;
    font-family: inherit;
  }
  .bl-tab:hover { color: var(--ink, #e8e4da); }
  .bl-tab--active {
    color: #4ade80;
    border-bottom-color: #4ade80;
    background: rgba(74,222,128,.04);
  }
  .bl-tab--active:last-child {
    color: #f87171;
    border-bottom-color: #f87171;
    background: rgba(248,113,113,.04);
  }

  .bl-tab-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .bl-tab-dot--buff   { background: #4ade80; box-shadow: 0 0 5px rgba(74,222,128,.5); }
  .bl-tab-dot--debuff { background: #f87171; box-shadow: 0 0 5px rgba(248,113,113,.5); }

  .bl-count {
    font-size: .58rem;
    font-weight: 800;
    padding: 1px 5px;
    border-radius: 999px;
  }
  .bl-count--buff   { background: rgba(74,222,128,.15); border: 1px solid rgba(74,222,128,.3); color: #4ade80; }
  .bl-count--debuff { background: rgba(248,113,113,.15); border: 1px solid rgba(248,113,113,.3); color: #f87171; }

  .bl-collapse {
    padding: 0 14px;
    background: none;
    border: none;
    color: var(--ink-muted, #8a8d85);
    font-size: .65rem;
    cursor: pointer;
    opacity: .5;
    transition: opacity .15s;
    font-family: inherit;
  }
  .bl-collapse:hover { opacity: 1; }

  /* ── Empty state ── */
  .bl-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 20px;
  }
  .bl-empty-icon { font-size: 1rem; opacity: .3; }
  .bl-empty-text { font-size: .75rem; color: var(--ink-muted, #8a8d85); font-style: italic; opacity: .5; }

  /* ── Cards list ── */
  .bl-list {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .bl-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-bottom: 1px solid rgba(255,255,255,.04);
    transition: background .12s;
    position: relative;
  }
  .bl-card::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: var(--c, #4ade80);
    opacity: .6;
  }
  .bl-card:hover { background: rgba(255,255,255,.02); }
  .bl-card:last-child { border-bottom: none; }
  .bl-card--debuff::before { opacity: .5; }

  /* ── Info ── */
  .bl-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .bl-info-top {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .bl-buff-name {
    font-size: .88rem;
    font-weight: 800;
    letter-spacing: .02em;
  }

  .bl-duration {
    font-size: .62rem;
    font-weight: 700;
    padding: 1px 6px;
    border-radius: 999px;
    background: rgba(52,211,153,.1);
    border: 1px solid rgba(52,211,153,.22);
    color: #34d399;
    flex-shrink: 0;
  }
  .bl-duration--passive {
    background: rgba(167,139,250,.1);
    border-color: rgba(167,139,250,.22);
    color: #a78bfa;
  }

  .bl-effect {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: .78rem;
  }

  .bl-potency {
    color: var(--ink-muted, #8a8d85);
    font-family: 'Courier New', monospace;
    font-weight: 600;
    font-size: .75rem;
  }
  .bl-arrow {
    color: var(--ink-muted, #8a8d85);
    opacity: .35;
    font-size: .65rem;
  }
  .bl-value {
    font-weight: 800;
    font-family: 'Courier New', monospace;
    font-size: .9rem;
    text-shadow: 0 0 10px color-mix(in srgb, var(--c, #4ade80) 40%, transparent);
  }

  .bl-desc {
    font-size: .7rem;
    color: var(--ink-muted, #8a8d85);
    line-height: 1.35;
    opacity: .65;
  }

  .bl-condition {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: .65rem;
    color: var(--ink-muted, #8a8d85);
    font-style: italic;
  }
  .bl-cond-dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--c, #4ade80);
    opacity: .5;
    flex-shrink: 0;
  }

  /* ── Source ── */
  .bl-source {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
    flex-shrink: 0;
    min-width: 80px;
  }
  .bl-src-type {
    font-size: .58rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: .12em;
    padding: 2px 6px;
    border-radius: 4px;
    border: 1px solid;
  }
  .bl-src-name {
    font-size: .68rem;
    font-weight: 600;
    color: var(--ink-muted, #8a8d85);
    text-align: right;
    line-height: 1.3;
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* ── Legend ── */
  .bl-legend {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    background: rgba(255,255,255,.02);
    border-top: 1px solid rgba(255,255,255,.04);
    font-size: .62rem;
    color: var(--ink-muted, #8a8d85);
    opacity: .5;
    font-style: italic;
  }
  .bl-leg-icon { opacity: .6; }
</style>