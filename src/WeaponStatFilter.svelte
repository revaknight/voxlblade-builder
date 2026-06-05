<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  const dispatch = createEventDispatcher<{ change: Map<string, 'include' | 'exclude'> }>()
  export let value: Map<string, 'include' | 'exclude'> = new Map()

  const DMG_TYPE_GROUP = {
    label: 'Damage Type',
    color: '#fb923c',
    stats: [
      { key: 'trueType',     label: 'True'     },
      { key: 'physicalType', label: 'Physical' },
      { key: 'magicType',    label: 'Magic'    },
      { key: 'fireType',     label: 'Fire'     },
      { key: 'waterType',    label: 'Water'    },
      { key: 'earthType',    label: 'Earth'    },
      { key: 'airType',      label: 'Air'      },
      { key: 'hexType',      label: 'Hex'      },
      { key: 'holyType',     label: 'Holy'     },
      { key: 'summonType',   label: 'Summon'   },
    ],
  }

  const SCALING_GROUP = {
    label: 'Scaling',
    color: '#a78bfa',
    stats: [
      { key: 'dexterityScaling', label: 'Dexterity' },
      { key: 'physicalScaling',  label: 'Physical'  },
      { key: 'magicScaling',     label: 'Magic'     },
      { key: 'fireScaling',      label: 'Fire'      },
      { key: 'waterScaling',     label: 'Water'     },
      { key: 'earthScaling',     label: 'Earth'     },
      { key: 'airScaling',       label: 'Air'       },
      { key: 'hexScaling',       label: 'Hex'       },
      { key: 'holyScaling',      label: 'Holy'      },
      { key: 'summonScaling',    label: 'Summon'    },
    ],
  }

  const BOOST_GROUP = {
    label: 'Boost / Stats',
    color: '#4ade80',
    stats: [
      { key: 'dexterityBoost',  label: 'Dexterity' },
      { key: 'physicalBoost',   label: 'Physical'  },
      { key: 'magicBoost',      label: 'Magic'     },
      { key: 'fireBoost',       label: 'Fire'      },
      { key: 'waterBoost',      label: 'Water'     },
      { key: 'earthBoost',      label: 'Earth'     },
      { key: 'airBoost',        label: 'Air'       },
      { key: 'hexBoost',        label: 'Hex'       },
      { key: 'holyBoost',       label: 'Holy'      },
      { key: 'summonBoost',     label: 'Summon'    },
      { key: 'protection',      label: 'Protection'},
      { key: 'warding',         label: 'Warding'   },
      { key: 'speedBoost',      label: 'Speed'     },
      { key: 'jumpBoost',       label: 'Jump'      },
      { key: 'tenacity',        label: 'Tenacity'  },
      { key: 'magicDefense',    label: 'Magic Def' },
      { key: 'physicalDefense', label: 'Phys Def'  },
      { key: 'coldResistance',  label: 'Cold Res'  },
      { key: 'heatResistance',  label: 'Heat Res'  },
    ],
  }

  const GROUPS = [DMG_TYPE_GROUP, SCALING_GROUP, BOOST_GROUP]

  // TỐI ƯU HÓA: Bản đồ tra cứu nhanh để tránh lặp lồng nhau O(N^2) trong HTML UI
  const STAT_LABEL_MAP = new Map<string, string>()
  const STAT_COLOR_MAP = new Map<string, string>()
  const STAT_TAG_MAP = new Map<string, string>()

  function initLookupMaps() {
    for (const s of DMG_TYPE_GROUP.stats) {
      STAT_LABEL_MAP.set(s.key, s.label)
      STAT_COLOR_MAP.set(s.key, DMG_TYPE_GROUP.color)
      STAT_TAG_MAP.set(s.key, 'DMG')
    }
    for (const s of SCALING_GROUP.stats) {
      STAT_LABEL_MAP.set(s.key, s.label)
      STAT_COLOR_MAP.set(s.key, SCALING_GROUP.color)
      STAT_TAG_MAP.set(s.key, 'SCL')
    }
    for (const s of BOOST_GROUP.stats) {
      STAT_LABEL_MAP.set(s.key, s.label)
      STAT_COLOR_MAP.set(s.key, BOOST_GROUP.color)
      STAT_TAG_MAP.set(s.key, 'STAT')
    }
  }
  initLookupMaps()

  // ── State ───────────────────────────────────────────────────────────────────
  let active: Map<string, 'include' | 'exclude'> = new Map(value)
  let expanded = false

  $: activeCount = active.size

  function toggle(key: string) {
    const cur = active.get(key)
    if (!cur)                   active.set(key, 'include')
    else if (cur === 'include') active.set(key, 'exclude')
    else                        active.delete(key)
    active = new Map(active)
    dispatch('change', active)
  }

  function remove(key: string) {
    active.delete(key)
    active = new Map(active)
    dispatch('change', active)
  }

  function clear() {
    active = new Map()
    dispatch('change', active)
  }

  function handleChipKeyDown(e: KeyboardEvent, key: string) {
    if (e.key === 'Delete' || (e.key === 'Backspace' && e.shiftKey)) {
      e.preventDefault()
      remove(key)
    }
  }

  // ── Public filter function (used by parent) ─────────────────────────────────
  // TỐI ƯU HÓA: Đọc trực tiếp, không nhân bản (shallow clone) object nữa giúp chạy nhanh gấp nhiều lần và tiết kiệm RAM
  export function matchesFilter(item: Record<string, any>): boolean {
    if (active.size === 0) return true
    
    for (const [key, state] of active) {
      // Ưu tiên đọc từ sub-object item.stats trước, nếu không có mới tìm ở tầng ngoài item
      const val = (item.stats && key in item.stats) ? item.stats[key] : (item[key] ?? 0)
      
      if (state === 'include' && !(val > 0)) return false
      if (state === 'exclude' &&   val > 0)  return false
    }
    return true
  }
</script>

<div class="wsf-root">
  <div class="wsf-header">
    <button 
      class="wsf-toggle" 
      aria-expanded={expanded} 
      on:click={() => expanded = !expanded}
    >
      <span class="wsf-icon">{expanded ? '▾' : '▸'}</span>
      <span class="wsf-title">Filter by Weapon Stat</span>
      {#if activeCount > 0}
        <span class="wsf-badge">{activeCount} active</span>
      {:else}
        <span class="wsf-hint">dmg type · scaling · boost</span>
      {/if}
    </button>

    {#if activeCount > 0}
      <div class="wsf-active-row">
        {#each [...active.entries()] as [key, state]}
          <button
            class="wsf-chip wsf-chip--active"
            class:wsf-chip--include={state === 'include'}
            class:wsf-chip--exclude={state === 'exclude'}
            style="--c:{STAT_COLOR_MAP.get(key) ?? '#8a8d85'}"
            title="Click to cycle · Right-click or press Delete to remove"
            aria-label="Weapon filter {STAT_LABEL_MAP.get(key) ?? key}: {state}. Click to cycle, Delete to remove."
            on:click={() => toggle(key)}
            on:contextmenu|preventDefault={() => remove(key)}
            on:keydown={(e) => handleChipKeyDown(e, key)}
          >
            <span class="wsf-tag">{STAT_TAG_MAP.get(key) ?? 'STAT'}</span>
            <span class="wsf-sign">{state === 'include' ? '+' : '−'}</span>
            {STAT_LABEL_MAP.get(key) ?? key}
          </button>
        {/each}
        <button class="wsf-clear" on:click={clear}>Clear all</button>
      </div>
    {/if}
  </div>

  {#if expanded}
    <div class="wsf-panel">
      <p class="wsf-legend">
        <span class="wsf-leg wsf-leg--off">○ Off</span>
        <span class="wsf-leg wsf-leg--inc">+ Must have</span>
        <span class="wsf-leg wsf-leg--exc">− Must NOT have</span>
        <span class="wsf-leg-hint">· Click to cycle · Right-click or Delete to remove</span>
      </p>

      {#each GROUPS as group}
        <div class="wsf-group">
          <div class="wsf-group-head">
            <span class="wsf-group-label" style="color:{group.color};">{group.label}</span>
          </div>
          <div class="wsf-chips">
            {#each group.stats as stat}
              {@const state = active.get(stat.key)}
              <button
                class="wsf-chip"
                class:wsf-chip--include={state === 'include'}
                class:wsf-chip--exclude={state === 'exclude'}
                style="--c:{group.color}"
                aria-pressed={!!state}
                aria-label="{stat.label} weapon filter. Current state: {state ?? 'off'}."
                on:click={() => toggle(stat.key)}
                on:contextmenu|preventDefault={() => remove(stat.key)}
                on:keydown={(e) => handleChipKeyDown(e, stat.key)}
              >
                {#if state}
                  <span class="wsf-sign">{state === 'include' ? '+' : '−'}</span>
                {/if}
                {stat.label}
              </button>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .wsf-root {
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
  .wsf-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    flex-wrap: wrap;
  }
  .wsf-toggle {
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
  .wsf-toggle:hover { color: var(--ink, #e8e4da); }
  .wsf-icon  { font-size: .65rem; opacity: .6; width: 10px; }
  .wsf-title { font-size: .62rem; font-weight: 700; text-transform: uppercase; letter-spacing: .14em; }
  .wsf-badge {
    font-size: .58rem; font-weight: 800; padding: 1px 6px; border-radius: 999px;
    background: rgba(251,146,60,.18);
    border: 1px solid rgba(251,146,60,.35); color: #fb923c;
  }
  .wsf-hint { font-size: .58rem; opacity: .35; font-style: italic; }

  .wsf-active-row { display: flex; flex-wrap: wrap; gap: 3px; align-items: center; flex: 1; }
  .wsf-clear {
    font-size: .6rem; font-weight: 700; padding: 2px 8px; border-radius: 999px;
    border: 1px solid rgba(248,113,113,.25);
    background: rgba(248,113,113,.08);
    color: #f87171; cursor: pointer; font-family: inherit; transition: all .12s; flex-shrink: 0;
  }
  .wsf-clear:hover { background: rgba(248,113,113,.2); }

  /* Panel */
  .wsf-panel {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 8px 10px 10px;
    border-top: 1px solid rgba(255,255,255,.06);
    animation: wsfOpen .12s ease;
  }
  @keyframes wsfOpen {
    from { opacity: 0; transform: translateY(-4px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* Legend */
  .wsf-legend { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; margin-bottom: 2px; }
  .wsf-leg { font-size: .58rem; font-weight: 700; padding: 1px 6px; border-radius: 4px; }
  .wsf-leg--off  { color: #8a8d85; background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08); }
  .wsf-leg--inc  { color: #4ade80; background: rgba(74,222,128,.1);   border: 1px solid rgba(74,222,128,.25); }
  .wsf-leg--exc  { color: #f87171; background: rgba(248,113,113,.1);  border: 1px solid rgba(248,113,113,.25); }
  .wsf-leg-hint  { font-size: .55rem; color: #8a8d85; opacity: .45; font-style: italic; }

  /* Groups */
  .wsf-group { display: flex; flex-direction: column; gap: 5px; }
  .wsf-group-head { display: flex; align-items: center; }
  .wsf-group-label {
    font-size: .55rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: .18em;
    opacity: .8;
  }
  .wsf-chips { display: flex; flex-wrap: wrap; gap: 3px; padding-left: 4px; }

  /* Chips */
  .wsf-chip {
    display: inline-flex; align-items: center; gap: 3px;
    font-size: .62rem;
    font-weight: 600;
    padding: 2px 8px; border-radius: 999px;
    border: 1px solid rgba(255,255,255,.08);
    background: rgba(255,255,255,.03);
    color: #8a8d85; cursor: pointer; transition: all .12s;
    font-family: inherit; line-height: 1.5; user-select: none;
  }
  .wsf-chip:hover {
    border-color: color-mix(in srgb, var(--c, #fb923c) 50%, transparent);
    color: var(--c, #fb923c);
    background: color-mix(in srgb, var(--c, #fb923c) 10%, transparent);
  }
  .wsf-chip--include {
    background: rgba(74,222,128,.14);
    border-color: rgba(74,222,128,.45);
    color: #4ade80; font-weight: 700;
    box-shadow: 0 0 6px rgba(74,222,128,.15);
  }
  .wsf-chip--include:hover { background: rgba(74,222,128,.22); border-color: rgba(74,222,128,.7); color: #4ade80; }
  .wsf-chip--exclude {
    background: rgba(248,113,113,.12);
    border-color: rgba(248,113,113,.4);
    color: #f87171; font-weight: 700;
    box-shadow: 0 0 6px rgba(248,113,113,.12);
  }
  .wsf-chip--exclude:hover { background: rgba(248,113,113,.22); border-color: rgba(248,113,113,.65); color: #f87171; }

  .wsf-sign { font-size: .7rem; font-weight: 900; line-height: 1; margin-right: 1px; }

  /* Tag badge (DMG / SCL / STAT) shown in active row */
  .wsf-tag {
    font-size: .48rem;
    font-weight: 800; letter-spacing: .1em;
    padding: 1px 4px; border-radius: 3px;
    background: color-mix(in srgb, var(--c, #fb923c) 18%, transparent);
    color: var(--c, #fb923c);
    border: 1px solid color-mix(in srgb, var(--c, #fb923c) 35%, transparent);
    flex-shrink: 0;
  }
</style>