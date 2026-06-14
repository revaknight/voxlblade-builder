export type FilterState = 'include' | 'exclude'
export type FilterMap = Map<string, FilterState>

export function createFilterActions(
  getActive: () => FilterMap,
  setActive: (next: FilterMap) => void,
  notify: (next: FilterMap) => void
) {
  function toggle(key: string) {
    const active = getActive()
    const cur = active.get(key)
    if (!cur) active.set(key, 'include')
    else if (cur === 'include') active.set(key, 'exclude')
    else active.delete(key)
    const next = new Map(active)
    setActive(next)
    notify(next)
  }

  function remove(key: string) {
    const next = new Map(getActive())
    next.delete(key)
    setActive(next)
    notify(next)
  }

  function clear() {
    const next: FilterMap = new Map()
    setActive(next)
    notify(next)
  }

  function handleChipKeyDown(e: KeyboardEvent, key: string) {
    if (e.key === 'Delete' || (e.key === 'Backspace' && e.shiftKey)) {
      e.preventDefault()
      remove(key)
    }
  }

  return { toggle, remove, clear, handleChipKeyDown }
}