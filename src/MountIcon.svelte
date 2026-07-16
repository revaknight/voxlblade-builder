<script lang="ts">
  export let size: number = 16
  const uid = Math.random().toString(36).slice(2, 7)
</script>

<svg viewBox="0 0 128 128" width={size} height={size} style="display:inline-block;vertical-align:middle;flex-shrink:0">
  <defs>
    <linearGradient id="mg-{uid}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#3b82f6"/>
      <stop offset="100%" stop-color="#06b6d4"/>
    </linearGradient>
  </defs>
  <path fill="url(#mg-{uid})" d="M 110 35 L 88 18 L 68 26 L 42 48 L 20 72 L 8 88 L 12 96 L 24 80 L 18 110 L 34 86 L 42 72 L 34 102 L 50 76 L 60 56 L 86 42 Z"/>
</svg>
