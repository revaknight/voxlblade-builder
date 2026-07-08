# Voxlblade UI Upgrade Plan

## Current State

- **App.svelte**: 4456 lines (script ~1264 + template ~1860 + CSS ~1332)
- **DamageAnalyzer.svelte**: 5766 lines
- **12 modal types** in App.svelte with near-identical templates (race, guild, armor x3, infusion x3, ring, infusion-ring, rune, blade, handle, glove, essence)
- **CSS**: ~1330 lines inline in App.svelte, with duplicate `:root` blocks and scattered variables
- **Components**: BuffList, BuildSaves, ModalSearchHeader, etc. are well-structured
- **Svelte 5** with `$:` reactive statements (no runes yet)
- No toast system, no build comparison, limited responsive support

## Key File References

- `src/App.svelte` — main app (script: lines 1-1264, template: 1266-3125, style: 3126-4456)
- `src/DamageAnalyzer.svelte` — 5766 lines (separate concern, leave mostly alone)
- `src/lib/store.ts` — writable/derived stores
- `src/lib/types.ts` — type definitions
- `src/lib/uiConstants.ts` — UI colors, labels (used by BuffList)
- `src/app.css` — 88 lines of global styles
- `src/BuildSaves.svelte` — 504 lines
- `src/BuffList.svelte` — 735 lines
- `src/ModalSearchHeader.svelte` — 197 lines

## Design Tokens Used

```css
--bg: #0d0f0e; --surface: #141715; --surface2: #1a1d1b; --surface3: #212420;
--border: rgba(255,255,255,0.06); --border-strong: rgba(255,255,255,0.1);
--ink: #e8e4da; --ink-muted: #8a8d85;
--accent: #4ade80; --accent2: #f59e0b; --accent3: #a78bfa;
--infusion: #38bdf8; --neg: #f87171;
--weapon-blade: #fb923c; --weapon-handle: #34d399; --weapon-combined: #fbbf24;
--monk-glove: #e879f9; --monk-essence: #818cf8; --monk-combined: #c084fc;
--radius: 14px; --radius-sm: 8px;
--font-display: serif; --font-body: sans-serif;
```

## Implementation Phases

### Phase 1: Extract Modal System
**Goal**: Replace 12 repetitive modal templates with a data-driven Modal component
- Create `src/lib/modals/` directory
- Create `Modal.svelte` — shared modal shell (overlay, close, search header)
- Create `ModalList.svelte` — shared list with item rendering
- Create `ItemSelectModal.svelte` — generic data-driven modal
- Refactor App.svelte to use data-driven modal approach
- Impact: reduce App.svelte by ~1500+ lines

### Phase 2: Toast/Notification System
**Goal**: Add user feedback for actions (save, load, export, undo, clear)
- Create `src/lib/Toast.svelte` — toast container with stack
- Create `src/lib/toast.ts` — writable store for toasts
- Integrate with BuildSaves save/load/export
- Integrate with undo/clear
- Auto-dismiss after timeout

### Phase 3: Extract App Header and Layout
**Goal**: Modularize the app shell
- Create `src/lib/AppHeader.svelte` — header + tab navigation + build saves
- Keep layout logic clean

### Phase 4: CSS Variables Consolidation
**Goal**: Single source of truth for design tokens
- Move all `:root` CSS variables to `src/app.css`
- Remove duplicate `:root` blocks from App.svelte
- Ensure all components reference shared variables

### Phase 5: Responsive Improvements
**Goal**: Better mobile experience
- Improve grid auto-fill behavior
- Better overflow handling for summary grid on mobile
- Modal responsive sizing
- Touch-friendly interaction targets

### Phase 6: Performance
**Goal**: Reduce unnecessary reactivity
- Audit heavy `$:` blocks
- Consider `$derived` patterns where possible
- Lazy-load modal content

### Phase 7: Accessibility
**Goal**: Better a11y
- Focus trap in modals
- Keyboard navigation improvements
- ARIA labels on interactive elements
- Remove existing `a11y-ignore` comments

### Phase 8: Build Comparison (stretch)
**Goal**: Compare two builds side-by-side
- Split `build` store into two instances
- Comparison view with diff highlighting

## Risks & Mitigations

- **DamageAnalyzer.svelte** is 5766 lines but is a separate concern — leave alone unless bugs arise
- **Heavy $: blocks** may need manual conversion to $derived for Svelte 5 migration readiness
- **No test suite** — manual verification required after each phase
- **Build comparison** is complex — defer to later phase
