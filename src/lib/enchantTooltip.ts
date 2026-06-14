import { getEnchant } from './engine'

export function getEnchantTooltipText(name: string, includeDescription = true): string {
  if (!name) return ''
  const e = getEnchant(name)
  if (!e) return ''
  
  const lines: string[] = []
  
  // Sử dụng biến flag để kiểm tra xem có thêm description không
  if (includeDescription && e.description) {
    lines.push(e.description)
  }
  
  const statLines = Object.entries(e.stats).flatMap(([k, v]) => {
    if (!v) return []
    const mods = Array.isArray(v) ? v : [v]
    return [mods.map((m: any) =>
      m.type === 'multiplier' ? `${k}: ×${m.value}` : `${k}: ${m.value > 0 ? '+' : ''}${m.value}`
    ).join(', ')]
  })
  
  if (statLines.length) lines.push('Stats: ' + statLines.join(' | '))
  if (e.effects?.length) lines.push('Effects: ' + e.effects.map((ef: any) => `${ef.name} +${ef.value}`).join(', '))
  if (e.additionalNotes) lines.push('⚠ ' + e.additionalNotes)
  
  return lines.join('\n')
}