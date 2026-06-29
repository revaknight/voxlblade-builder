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
  const q = query.trim()
  if (!q) return text

  const lowerText = text.toLowerCase()
  const lowerQuery = q.toLowerCase()

  let result = ''
  let start = 0

  while (true) {
    const index = lowerText.indexOf(lowerQuery, start)

    if (index === -1) {
      result += text.slice(start)
      break
    }

    result += text.slice(start, index)
    result += `<mark class="modal-hl">${text.slice(index, index + q.length)}</mark>`

    start = index + q.length
  }

  return result
}