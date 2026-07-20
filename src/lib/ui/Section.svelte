<script lang="ts">
  import type { Snippet } from 'svelte'

  let {
    title,
    variant = 'default',
    gap = 'md',
    children,
    header,
  }: {
    title?: string
    variant?: 'default' | 'green' | 'amber' | 'red' | 'purple' | 'blue' | 'teal' | 'draco'
    gap?: 'sm' | 'md' | 'lg'
    children?: Snippet
    header?: Snippet
  } = $props()
</script>

<div
  class="ui-section"
  class:ui-section--green={variant === 'green'}
  class:ui-section--amber={variant === 'amber'}
  class:ui-section--red={variant === 'red'}
  class:ui-section--purple={variant === 'purple'}
  class:ui-section--blue={variant === 'blue'}
  class:ui-section--teal={variant === 'teal'}
  class:ui-section--draco={variant === 'draco'}
  class:ui-section--gap-sm={gap === 'sm'}
  class:ui-section--gap-lg={gap === 'lg'}
>
  {#if title || header}
    <div class="ui-section__header">
      {#if header}{@render header()}{:else}
        <span class="ui-section__title">{title}</span>
      {/if}
    </div>
  {/if}
  <div class="ui-section__body">
    {#if children}{@render children()}{/if}
  </div>
</div>

<style>
  .ui-section {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: var(--space-3);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .ui-section__header {
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.18em;
    font-weight: var(--weight-extrabold);
    color: var(--ink-muted);
    border-bottom: 1px solid var(--border);
    padding-bottom: var(--space-2);
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .ui-section__title {
    font-size: inherit;
    text-transform: inherit;
    letter-spacing: inherit;
    font-weight: inherit;
    color: inherit;
  }

  .ui-section__body {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  /* Gap variants */
  .ui-section--gap-sm { gap: var(--space-2); }
  .ui-section--gap-sm .ui-section__body { gap: var(--space-2); }
  .ui-section--gap-lg { gap: var(--space-4); }
  .ui-section--gap-lg .ui-section__body { gap: var(--space-4); }

  /* Color variants */
  .ui-section--green {
    border-color: rgba(74,222,128,0.15);
    background: linear-gradient(160deg, var(--surface) 60%, rgba(74,222,128,0.03) 100%);
  }
  .ui-section--green .ui-section__header { border-bottom-color: rgba(74,222,128,0.15); color: var(--accent); }

  .ui-section--amber {
    border-color: rgba(245,158,11,0.15);
    background: linear-gradient(160deg, var(--surface) 60%, rgba(245,158,11,0.03) 100%);
  }
  .ui-section--amber .ui-section__header { border-bottom-color: rgba(245,158,11,0.15); color: var(--accent2); }

  .ui-section--red {
    border-color: rgba(248,113,113,0.15);
    background: linear-gradient(160deg, var(--surface) 60%, rgba(248,113,113,0.03) 100%);
  }
  .ui-section--red .ui-section__header { border-bottom-color: rgba(248,113,113,0.15); color: var(--neg); }

  .ui-section--purple {
    border-color: rgba(167,139,250,0.18);
    background: linear-gradient(160deg, var(--surface) 60%, rgba(167,139,250,0.04) 100%);
  }
  .ui-section--purple .ui-section__header { border-bottom-color: rgba(167,139,250,0.18); color: var(--accent3); }

  .ui-section--blue {
    border-color: rgba(56,189,248,0.15);
    background: linear-gradient(160deg, var(--surface) 60%, rgba(56,189,248,0.03) 100%);
  }
  .ui-section--blue .ui-section__header { border-bottom-color: rgba(56,189,248,0.15); color: var(--infusion); }

  .ui-section--teal {
    border-color: rgba(52,211,153,0.15);
    background: linear-gradient(160deg, var(--surface) 60%, rgba(52,211,153,0.03) 100%);
  }
  .ui-section--teal .ui-section__header { border-bottom-color: rgba(52,211,153,0.15); color: var(--weapon-handle); }

  .ui-section--draco {
    border-color: var(--draco-border-soft);
    background: linear-gradient(160deg, var(--surface) 60%, var(--draco-bg-4) 100%);
  }
  .ui-section--draco .ui-section__header { border-bottom-color: var(--draco-border-soft); color: var(--draco-text); }
</style>
