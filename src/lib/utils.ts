function calculateMultiplierFromPct(pct: number): number {
  return Math.round((1 + pct / 100) * 10000) / 10000
}

function multiplyMultipliers(multipliers: number[]): number {
  return multipliers.reduce((acc, m) => acc * m, 1.0)
}

export function roundMultiplier(multiplier: number): number {
  return Math.round(multiplier * 10000) / 10000
}

export function highlightText(text: string, query: string): string {
  if (!query.trim()) return text
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return text.replace(new RegExp(`(${escaped})`, 'gi'), '<mark class="modal-hl">$1</mark>')
}
