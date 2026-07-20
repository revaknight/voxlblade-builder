<script lang="ts">
  import type { Snippet } from 'svelte'

  let {
    variant = 'default',
    hoverable = false,
    accent,
    padding = 'md',
    gap = 'md',
    onclick,
    children,
  }: {
    variant?: 'default' | 'surface' | 'ghost'
    hoverable?: boolean
    accent?: 'green' | 'amber' | 'red' | 'purple' | 'blue' | 'teal' | 'draco'
    padding?: 'none' | 'sm' | 'md' | 'lg'
    gap?: 'none' | 'sm' | 'md' | 'lg'
    onclick?: () => void
    children?: Snippet
  } = $props()
</script>

<div
  class="ui-card"
  class:ui-card--hover={hoverable}
  class:ui-card--surface={variant === 'surface'}
  class:ui-card--ghost={variant === 'ghost'}
  class:ui-card--accent-green={accent === 'green'}
  class:ui-card--accent-amber={accent === 'amber'}
  class:ui-card--accent-red={accent === 'red'}
  class:ui-card--accent-purple={accent === 'purple'}
  class:ui-card--accent-blue={accent === 'blue'}
  class:ui-card--accent-teal={accent === 'teal'}
  class:ui-card--accent-draco={accent === 'draco'}
  class:ui-card--pad-none={padding === 'none'}
  class:ui-card--pad-sm={padding === 'sm'}
  class:ui-card--pad-lg={padding === 'lg'}
  class:ui-card--gap-none={gap === 'none'}
  class:ui-card--gap-sm={gap === 'sm'}
  class:ui-card--gap-lg={gap === 'lg'}
  role={onclick ? 'button' : undefined}
  tabindex={onclick ? 0 : undefined}
  onclick={onclick ? () => onclick() : undefined}
  onkeydown={onclick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onclick!() } : undefined}
>
  {#if children}{@render children()}{/if}
</div>

<style>
  .ui-card {
    display: flex;
    flex-direction: column;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: var(--space-3);
    gap: var(--space-2);
    transition: border-color var(--duration-normal) var(--ease-out),
                box-shadow var(--duration-normal) var(--ease-out);
  }

  /* Hover */
  .ui-card--hover { cursor: pointer; }
  .ui-card--hover:hover {
    border-color: var(--border-hover);
    box-shadow: var(--shadow-sm);
  }

  /* Variants */
  .ui-card--surface {
    background: var(--surface);
  }
  .ui-card--ghost {
    background: transparent;
    border-color: transparent;
  }

  /* Accent borders */
  .ui-card--accent-green { border-color: rgba(74,222,128,0.15); }
  .ui-card--accent-green.ui-card--hover:hover { border-color: rgba(74,222,128,0.3); box-shadow: 0 0 0 1px rgba(74,222,128,0.08); }
  .ui-card--accent-amber { border-color: rgba(245,158,11,0.15); }
  .ui-card--accent-amber.ui-card--hover:hover { border-color: rgba(245,158,11,0.3); box-shadow: 0 0 0 1px rgba(245,158,11,0.08); }
  .ui-card--accent-red { border-color: rgba(248,113,113,0.15); }
  .ui-card--accent-red.ui-card--hover:hover { border-color: rgba(248,113,113,0.3); box-shadow: 0 0 0 1px rgba(248,113,113,0.08); }
  .ui-card--accent-purple { border-color: rgba(167,139,250,0.15); }
  .ui-card--accent-purple.ui-card--hover:hover { border-color: rgba(167,139,250,0.3); box-shadow: 0 0 0 1px rgba(167,139,250,0.08); }
  .ui-card--accent-blue { border-color: rgba(56,189,248,0.15); }
  .ui-card--accent-blue.ui-card--hover:hover { border-color: rgba(56,189,248,0.3); box-shadow: 0 0 0 1px rgba(56,189,248,0.08); }
  .ui-card--accent-teal { border-color: rgba(52,211,153,0.15); }
  .ui-card--accent-teal.ui-card--hover:hover { border-color: rgba(52,211,153,0.3); box-shadow: 0 0 0 1px rgba(52,211,153,0.08); }
  .ui-card--accent-draco { border-color: var(--draco-border-soft); }
  .ui-card--accent-draco.ui-card--hover:hover { border-color: var(--draco-border); box-shadow: var(--draco-shadow); }

  /* Padding */
  .ui-card--pad-none { padding: 0; }
  .ui-card--pad-sm { padding: var(--space-2); }
  .ui-card--pad-lg { padding: var(--space-4); }

  /* Gap */
  .ui-card--gap-none { gap: 0; }
  .ui-card--gap-sm { gap: var(--space-1); }
  .ui-card--gap-lg { gap: var(--space-3); }
</style>
