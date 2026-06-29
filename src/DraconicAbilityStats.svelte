<script lang="ts">
  export let dracoColor: any
  export let poiseDmg: number
  export let healHoly: number | string = ''
  export let healWater: number | string = ''
  export let showHoly: boolean = false
  export let showWater: boolean = false
</script>

<div class="dab-stat-row">
  <span class="dab-stat-k">Dmg Type</span>
  <span class="dab-stat-v" style={dracoColor ? `color:${dracoColor.color}` : 'color:#fb923c'}>
    {dracoColor ? dracoColor.stat.charAt(0).toUpperCase() + dracoColor.stat.slice(1) : 'Physical'} 1.0
  </span>
</div>
<div class="dab-stat-row">
  <span class="dab-stat-k">Scaling</span>
  <span class="dab-stat-v" style={dracoColor ? `color:${dracoColor.color}` : 'color:#fb923c'}>
    1.0 {dracoColor ? dracoColor.stat.charAt(0).toUpperCase() + dracoColor.stat.slice(1) : 'Physical'}
  </span>
</div>
<div class="dab-stat-row">
  <span class="dab-stat-k">Poise Dmg</span>
  <span class="dab-stat-v dab-stat-v--poise">{poiseDmg}</span>
</div>
{#if showHoly}
  <div class="dab-stat-row">
    <span class="dab-stat-k">Heal (Holy)</span>
    <span class="dab-stat-v">{healHoly}</span>
  </div>
{/if}
{#if showWater}
  <div class="dab-stat-row">
    <span class="dab-stat-k">Heal (Water)</span>
    <span class="dab-stat-v">{healWater}</span>
  </div>
  <div class="dab-notes">Cleanses</div>
{/if}

<style>
  .dab-stat-v--poise { color:#f472b6; font-weight:800; }
</style>
