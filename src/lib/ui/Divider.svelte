<script lang="ts">
  let {
    variant = 'default',
    spacing = 'md',
  }: {
    variant?: 'default' | 'green' | 'amber' | 'red' | 'purple' | 'blue' | 'teal' | 'draco'
    spacing?: 'none' | 'sm' | 'md' | 'lg'
  } = $props()
</script>

<hr
  class="ui-divider"
  class:ui-divider--green={variant === 'green'}
  class:ui-divider--amber={variant === 'amber'}
  class:ui-divider--red={variant === 'red'}
  class:ui-divider--purple={variant === 'purple'}
  class:ui-divider--blue={variant === 'blue'}
  class:ui-divider--teal={variant === 'teal'}
  class:ui-divider--draco={variant === 'draco'}
  class:ui-divider--none={spacing === 'none'}
  class:ui-divider--sm={spacing === 'sm'}
  class:ui-divider--lg={spacing === 'lg'}
/>

<style>
  .ui-divider {
    border: none;
    border-top: 1px solid var(--border);
    margin: var(--space-3) 0;
  }
  .ui-divider--none { margin: 0; }
  .ui-divider--sm { margin: var(--space-1-5) 0; }
  .ui-divider--lg { margin: var(--space-5) 0; }

  .ui-divider--green { border-top-color: rgba(74,222,128,0.15); }
  .ui-divider--amber { border-top-color: rgba(245,158,11,0.15); }
  .ui-divider--red { border-top-color: rgba(248,113,113,0.15); }
  .ui-divider--purple { border-top-color: rgba(167,139,250,0.18); }
  .ui-divider--blue { border-top-color: rgba(56,189,248,0.15); }
  .ui-divider--teal { border-top-color: rgba(52,211,153,0.15); }
  .ui-divider--draco { border-top-color: var(--draco-border-soft); }
</style>
