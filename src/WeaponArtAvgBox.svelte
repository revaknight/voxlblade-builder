<script lang="ts">
  export let total: number
  export let starsPerType: number
  export let rawTotal: number
</script>

<div class="wa-avg-total-box">
  <div class="wa-atb-left">
    <span class="wa-atb-label">Avg Total</span>
    <span class="wa-atb-hint">~{total} stars · {starsPerType}/type · base only</span>
  </div>
  <span class="wa-atb-base">{rawTotal}</span>
</div>

<style>
  .wa-avg-total-box {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-top: 6px;
    padding: 6px 10px;
    border-radius: 7px;
    background: rgba(167,139,250,.08);
    border: 1px solid rgba(167,139,250,.2);
    flex-wrap: wrap;
  }
  .wa-atb-left {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }
  .wa-atb-label {
    font-size: .6rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: .14em;
    color: var(--accent3);
    opacity: .8;
  }
  .wa-atb-hint {
    font-size: .58rem;
    color: var(--ink-muted);
    opacity: .5;
  }
  .wa-atb-base {
    font-family: 'Courier New', monospace;
    font-size: .95rem;
    font-weight: 800;
    color: var(--accent3);
    text-shadow: 0 0 10px rgba(167,139,250,.35);
  }
</style>
