<script lang="ts">
  import type { Snippet } from 'svelte'

  let {
    label,
    variant = 'default',
    size = 'md',
    hoverable = false,
    value,
    children,
  }: {
    label?: string
    variant?: 'default' | 'green' | 'amber' | 'red' | 'purple' | 'blue' | 'teal'
    size?: 'sm' | 'md' | 'lg'
    hoverable?: boolean
    value?: string | number
    children?: Snippet
  } = $props()
</script>

<div
  class="ui-stat"
  class:ui-stat--hover={hoverable}
  class:ui-stat--green={variant === 'green'}
  class:ui-stat--amber={variant === 'amber'}
  class:ui-stat--red={variant === 'red'}
  class:ui-stat--purple={variant === 'purple'}
  class:ui-stat--blue={variant === 'blue'}
  class:ui-stat--teal={variant === 'teal'}
  class:ui-stat--sm={size === 'sm'}
  class:ui-stat--lg={size === 'lg'}
>
  {#if label}
    <span class="ui-stat__label">{label}</span>
  {/if}
  <span class="ui-stat__value">
    {#if children}{@render children()}{:else}{value}{/if}
  </span>
</div>

<style>
  .ui-stat {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-1-5) var(--space-2);
    border-radius: var(--radius-sm);
    background: var(--surface3);
    transition: background var(--duration-fast) var(--ease-out);
  }
  .ui-stat--hover:hover {
    background: var(--surface4);
  }

  .ui-stat__label {
    font-size: var(--text-sm);
    color: var(--ink-muted);
    white-space: nowrap;
  }

  .ui-stat__value {
    font-weight: var(--weight-bold);
    color: var(--ink);
    white-space: nowrap;
    text-align: right;
  }

  /* Sizes */
  .ui-stat--sm {
    padding: 1px var(--space-1-5);
    gap: var(--space-1);
  }
  .ui-stat--sm .ui-stat__label { font-size: var(--text-2xs); }
  .ui-stat--sm .ui-stat__value { font-size: var(--text-xs); }

  .ui-stat--lg {
    padding: var(--space-2) var(--space-3);
  }
  .ui-stat--lg .ui-stat__label { font-size: var(--text-sm-plus); }
  .ui-stat--lg .ui-stat__value { font-size: var(--text-md); }

  /* Color variants — value color */
  .ui-stat--green .ui-stat__value { color: var(--accent); }
  .ui-stat--amber .ui-stat__value { color: var(--accent2); }
  .ui-stat--red .ui-stat__value { color: var(--neg); }
  .ui-stat--purple .ui-stat__value { color: var(--accent3); }
  .ui-stat--blue .ui-stat__value { color: var(--infusion); }
  .ui-stat--teal .ui-stat__value { color: var(--weapon-handle); }
</style>
