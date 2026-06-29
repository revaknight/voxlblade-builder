<script lang="ts">
  import { roundMultiplier } from './lib/utils'

  export let row: any
  export let useRoundMultiplier = false
  export let showZeroBoost = false
</script>

<div class="ds-row">
  <div class="ds-col ds-col--type">
    <span class="ds-dot" style="background:{row.color}"></span>
    <span style="color:{row.color}">{(row as any).label ?? (row.key.charAt(0).toUpperCase() + row.key.slice(1))}</span>
  </div>
  <div class="ds-col ds-col--val">
    <span class="ds-num" style="color:{row.color}">
      {useRoundMultiplier ? roundMultiplier(row.scalingVal) : row.scalingVal}
    </span>
  </div>
  <div class="ds-col ds-col--op">×</div>
  <div class="ds-col ds-col--boost">
    {#if showZeroBoost}
      {#if row.boostPct !== 0}
        <span class="ds-boost" style={row.boostPct < 0 ? 'color:#cf6679;' : ''}>{row.boostPct > 0 ? '+' : ''}{row.boostPct}%</span>
      {:else}
        <span class="ds-boost ds-boost--zero">+0%</span>
      {/if}
    {:else}
      <span class="ds-boost" style={row.boostPct < 0 ? 'color:#cf6679;' : ''}>{row.boostPct > 0 ? '+' : ''}{row.boostPct}%</span>
    {/if}
  </div>
  <div class="ds-col ds-col--op">=</div>
  <div class="ds-col ds-col--contrib">
    <span class="ds-contrib" class:ds-contrib--zero={row.contribution === 0}
      style={row.contribution > 0 ? `color:${row.color}` : row.contribution < 0 ? 'color:#cf6679;' : ''}>
      {row.contribution > 0 ? '+' : ''}{row.contribution}%
    </span>
  </div>
</div>
