<script lang="ts">
  import type { Snippet } from 'svelte'

  let {
    variant = 'default',
    padding = 'md',
    children,
    header,
  }: {
    variant?: 'default' | 'green' | 'amber' | 'red' | 'purple' | 'blue' | 'teal'
    padding?: 'none' | 'sm' | 'md' | 'lg'
    children?: Snippet
    header?: Snippet
  } = $props()
</script>

<div
  class="ui-panel"
  class:ui-panel--green={variant === 'green'}
  class:ui-panel--amber={variant === 'amber'}
  class:ui-panel--red={variant === 'red'}
  class:ui-panel--purple={variant === 'purple'}
  class:ui-panel--blue={variant === 'blue'}
  class:ui-panel--teal={variant === 'teal'}
  class:ui-panel--pad-none={padding === 'none'}
  class:ui-panel--pad-sm={padding === 'sm'}
  class:ui-panel--pad-lg={padding === 'lg'}
>
  {#if header}
    <div class="ui-panel__header">
      {@render header()}
    </div>
  {/if}
  <div class="ui-panel__body">
    {#if children}{@render children()}{/if}
  </div>
</div>

<style>
  .ui-panel {
    background: linear-gradient(180deg, var(--surface2) 0%, var(--surface) 100%);
    border: 1px solid var(--border);
    border-radius: var(--radius-xl);
    padding: var(--space-4);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    transition: border-color var(--duration-normal) var(--ease-out),
                box-shadow var(--duration-smooth) var(--ease-out);
  }

  .ui-panel__header {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .ui-panel__body {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  /* Padding */
  .ui-panel--pad-none { padding: 0; }
  .ui-panel--pad-sm { padding: var(--space-3); }
  .ui-panel--pad-lg { padding: var(--space-5); }

  /* Color variants */
  .ui-panel--green {
    border-color: rgba(74,222,128,0.12);
    background: linear-gradient(160deg, var(--surface2) 50%, rgba(74,222,128,0.025) 100%);
  }
  .ui-panel--amber {
    border-color: rgba(245,158,11,0.12);
    background: linear-gradient(160deg, var(--surface2) 50%, rgba(245,158,11,0.025) 100%);
  }
  .ui-panel--red {
    border-color: rgba(248,113,113,0.12);
    background: linear-gradient(160deg, var(--surface2) 50%, rgba(248,113,113,0.025) 100%);
  }
  .ui-panel--purple {
    border-color: rgba(167,139,250,0.15);
    background: linear-gradient(160deg, var(--surface2) 50%, rgba(167,139,250,0.03) 100%);
  }
  .ui-panel--blue {
    border-color: rgba(56,189,248,0.12);
    background: linear-gradient(160deg, var(--surface2) 50%, rgba(56,189,248,0.025) 100%);
  }
  .ui-panel--teal {
    border-color: rgba(52,211,153,0.12);
    background: linear-gradient(160deg, var(--surface2) 50%, rgba(52,211,153,0.025) 100%);
  }
</style>
