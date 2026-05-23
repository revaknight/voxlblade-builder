<!-- TagFilter.svelte -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  export let selectedTags: Set<string>

  const dispatch = createEventDispatcher()

  const TAG_GROUPS: Array<{ label: string; color: string; tags: string[] }> = [
    {
      label: 'Combat',
      color: '#fb923c',
      tags: ["Attack Speed","Damage Boost","Crit","Crit Damage","Finisher","RNG","Guardbreak","Poise","Defensive","Offensive", "Mobility"],
    },
    {
      label: 'Support',
      color: '#4ade80',
      tags: ["Healing","Heal Boost","Cleanse","Cooldown Reduction"],
    },
    {
      label: 'Status',
      color: '#f87171',
      tags: ["Bleed Potency","Burn Potency","Poison Potency","Buff","Debuff"],
    },
    {
      label: 'Weapon Art/Rune',
      color: '#38bdf8',
      tags:  ["Weapon Art","Weapon Art Activated","Rune","Rune Activated"],
    },
    {
      label: 'Special',
      color: '#a78bfa',
      tags: ["Summoner","Spirit (Monk)","Stance Change","Self-Damage","Self-Debuff","Stat Boost"],
    },
  ]

  // Color map for active chips
  const TAG_COLOR: Record<string, string> = {}
  for (const g of TAG_GROUPS) {
    for (const t of g.tags) TAG_COLOR[t] = g.color
  }

  let expanded = false

  function toggle(tag: string) {
    dispatch('toggle', tag)
  }

  function clear() {
    dispatch('clear')
  }

  $: activeCount = selectedTags.size
</script>

<div class="tf-root">
  <!-- Header row -->
  <div class="tf-header">
    <button class="tf-toggle" on:click={() => expanded = !expanded}>
      <span class="tf-icon">{expanded ? '▾' : '▸'}</span>
      <span class="tf-title">Filter by Perk Tag</span>
      {#if activeCount > 0}
        <span class="tf-badge">{activeCount} active</span>
      {:else}
        <span class="tf-hint">click to filter</span>
      {/if}
    </button>

    <!-- Active tag chips (shown even when collapsed) -->
    {#if activeCount > 0}
      <div class="tf-active-row">
        {#each [...selectedTags] as tag}
          <button
            class="tf-chip tf-chip--active"
            style="--c:{TAG_COLOR[tag] ?? '#a78bfa'}"
            on:click={() => toggle(tag)}
            title="Remove filter"
          >{tag} ✕</button>
        {/each}
        <button class="tf-clear" on:click={clear}>Clear all</button>
      </div>
    {/if}
  </div>

  <!-- Expanded panel -->
  {#if expanded}
    <div class="tf-panel">
      {#each TAG_GROUPS as group}
        <div class="tf-group">
          <span class="tf-group-label" style="color:{group.color}">{group.label}</span>
          <div class="tf-chips">
            {#each group.tags as tag}
              {@const active = selectedTags.has(tag)}
              <button
                class="tf-chip"
                class:tf-chip--active={active}
                style="--c:{group.color}"
                on:click={() => toggle(tag)}
              >{tag}</button>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .tf-root {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 8px;
    border-radius: 8px;
    border: 1px solid rgba(255,255,255,.06);
    background: rgba(255,255,255,.02);
    overflow: hidden;
    font-family: var(--font-body, 'Trebuchet MS', sans-serif);
  }

  /* Header */
  .tf-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    flex-wrap: wrap;
  }

  .tf-toggle {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 6px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    font-family: inherit;
    color: var(--ink-muted, #8a8d85);
    flex-shrink: 0;
    transition: color .15s;
  }
  .tf-toggle:hover { color: var(--ink, #e8e4da); }

  .tf-icon {
    font-size: .65rem;
    opacity: .6;
    width: 10px;
  }
  .tf-title {
    font-size: .62rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .14em;
  }
  .tf-badge {
    font-size: .58rem;
    font-weight: 800;
    padding: 1px 6px;
    border-radius: 999px;
    background: rgba(167,139,250,.2);
    border: 1px solid rgba(167,139,250,.4);
    color: #a78bfa;
  }
  .tf-hint {
    font-size: .58rem;
    opacity: .35;
    font-style: italic;
  }

  .tf-active-row {
    display: flex;
    flex-wrap: wrap;
    gap: 3px;
    align-items: center;
    flex: 1;
  }

  .tf-clear {
    font-size: .6rem;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 999px;
    border: 1px solid rgba(248,113,113,.25);
    background: rgba(248,113,113,.08);
    color: #f87171;
    cursor: pointer;
    font-family: inherit;
    transition: all .12s;
    flex-shrink: 0;
  }
  .tf-clear:hover { background: rgba(248,113,113,.2); }

  /* Expanded panel */
  .tf-panel {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 8px 10px 10px;
    border-top: 1px solid rgba(255,255,255,.06);
    animation: tfOpen .12s ease;
  }
  @keyframes tfOpen {
    from { opacity: 0; transform: translateY(-4px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .tf-group {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }

  .tf-group-label {
    font-size: .52rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: .14em;
    opacity: .7;
    flex-shrink: 0;
    min-width: 50px;
    text-align: right;
  }

  .tf-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 3px;
    flex: 1;
  }

  /* Chips */
  .tf-chip {
    font-size: .62rem;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 999px;
    border: 1px solid rgba(255,255,255,.08);
    background: rgba(255,255,255,.03);
    color: #8a8d85;
    cursor: pointer;
    transition: all .12s;
    font-family: inherit;
    line-height: 1.5;
  }
  .tf-chip:hover {
    border-color: color-mix(in srgb, var(--c, #a78bfa) 50%, transparent);
    color: var(--c, #a78bfa);
    background: color-mix(in srgb, var(--c, #a78bfa) 10%, transparent);
  }
  .tf-chip--active {
    background: color-mix(in srgb, var(--c, #a78bfa) 18%, transparent);
    border-color: color-mix(in srgb, var(--c, #a78bfa) 55%, transparent);
    color: var(--c, #a78bfa);
    font-weight: 700;
  }
</style>