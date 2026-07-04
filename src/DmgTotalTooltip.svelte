<script lang="ts">
  export let hit: {
    group: string; count: number
    types: Array<{
      key: string; label: string; color: string
      raw: number; critVal: number; forceCrit: boolean
      isHeal?: boolean; isCurseRip?: boolean
      isDragonState?: boolean; isChainLightning?: boolean
      isLuminescent?: boolean; isExplosiveCharge?: boolean
      typeBase: number; scalingMult: number; combatMult: number
      applicableBoosts: Array<{ perkName: string; label: string; mult: number }>
      weaponBoostMult: number; weaponBoostLabel?: string
      typeDebuffMult: number; defMult: number; enemyDefPct: number
      isCritExempt?: boolean
      healBoostMult?: number
    }>
  }
  export let useCrit: boolean = false

  $: groups = buildGroups(hit, useCrit)

  function buildGroups(h: typeof hit, crit: boolean) {
    const map = new Map<string, { label: string; color: string; total: number; entries: Array<{ label: string; val: number; badge: string }> }>()
    const count = h.count
    for (const t of h.types) {
      if (t.isHeal || t.isCurseRip) continue
      const val = (crit || t.forceCrit) ? t.critVal : t.raw
      const dsCount = t.isDragonState && (h.group === 'M1' || h.group === 'M2') ? 1 : count
      const total = t.isDragonState ? val * dsCount : val * count
      let g = map.get(t.key)
      if (!g) {
        g = { label: t.label, color: t.color, total: 0, entries: [] }
        map.set(t.key, g)
      }
      g.total += total
      let badge = ''
      if (t.isDragonState) badge = 'Dragon'
      else if (t.isChainLightning) badge = 'Chain'
      else if (t.isLuminescent) badge = 'Luminescent'
      else if (t.isExplosiveCharge) badge = 'Explosive'
      g.entries.push({ label: t.label, val: total, badge })
    }
    return [...map.entries()].map(([key, g]) => ({ key, ...g }))
  }
</script>

<div class="dtt-wrap">
  {#each groups as g}
    <div class="dtt-group">
      <div class="dtt-group-head">
        <span class="dtt-dot" style="background: {g.color}"></span>
        <span class="dtt-type-label" style="color: {g.color}">{g.label}</span>
        <span class="dtt-type-total">{g.total.toFixed(4)}</span>
      </div>
      <div class="dtt-entries">
        {#each g.entries as e}
          <div class="dtt-entry">
            <span class="dtt-entry-val">{e.val.toFixed(4)}</span>
            {#if e.badge}
              <span class="dtt-badge" style="background: {g.color}22; color: {g.color}">{e.badge}</span>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  {/each}
</div>

<style>
  .dtt-wrap {
    background: #1a1a1e;
    border: 1px solid rgba(255,255,255,.08);
    border-radius: 8px;
    padding: 10px 12px;
    font-size: .7rem;
    line-height: 1.4;
    min-width: 200px;
    box-shadow: 0 8px 32px rgba(0,0,0,.5);
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .dtt-group {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .dtt-group + .dtt-group {
    padding-top: 6px;
    border-top: 1px solid rgba(255,255,255,.06);
  }
  .dtt-group-head {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .dtt-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .dtt-type-label {
    font-weight: 600;
    text-transform: capitalize;
  }
  .dtt-type-total {
    margin-left: auto;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    color: #e8e4da;
  }
  .dtt-entries {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding-left: 14px;
  }
  .dtt-entry {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: .65rem;
    opacity: .8;
  }
  .dtt-entry-val {
    font-variant-numeric: tabular-nums;
    color: #c4c0b8;
  }
  .dtt-badge {
    font-size: .55rem;
    padding: 1px 5px;
    border-radius: 3px;
    font-weight: 600;
    letter-spacing: .02em;
  }
</style>
