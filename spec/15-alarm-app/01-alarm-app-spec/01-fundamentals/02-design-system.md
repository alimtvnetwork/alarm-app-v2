# Design System

**Version:** 1.4.0  
**Updated:** 2026-04-10  
**AI Confidence:** High  
**Ambiguity:** None

---

## Keywords

`design`, `colors`, `typography`, `spacing`, `theme`, `tailwind`

---

## Purpose

Defines visual design tokens, color palettes, typography, and component styling rules for the Alarm App.

---

## Color Palette

### Light Mode

| Token | Hex | Usage |
|-------|-----|-------|
| `--background` | `#faf8f5` | Page background (cream) |
| `--foreground` | `#2a2420` | Primary text |
| `--card` | `#f0ebe3` | Card/surface background (linen) |
| `--primary` | `#8b7355` | Primary actions, accent (brown) |
| `--primary-foreground` | `#faf8f5` | Text on primary |
| `--secondary` | `#c9b99a` | Secondary elements (tan) |
| `--muted` | `#f0ebe3` | Muted backgrounds |
| `--muted-foreground` | `#8b7355` | Muted text |
| `--border` | `#e0d8cc` | Border color |
| `--destructive` | `#c0392b` | Delete/error actions |

### Dark Mode

| Token | Hex | Usage |
|-------|-----|-------|
| `--background` | `#2a2420` | Page background (charcoal) |
| `--foreground` | `#f0ebe3` | Primary text (cream) |
| `--card` | `#3d3530` | Card/surface background (warm gray) |
| `--primary` | `#c9b99a` | Primary actions (tan) |
| `--primary-foreground` | `#2a2420` | Text on primary |
| `--secondary` | `#8b7355` | Secondary elements |
| `--muted` | `#3d3530` | Muted backgrounds |
| `--muted-foreground` | `#c9b99a` | Muted text |
| `--border` | `#4d4540` | Border color |
| `--destructive` | `#e74c3c` | Delete/error actions (brighter red for dark bg visibility) |

---

## Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| Clock digits | Outfit | 4rem (64px) | 300 (Light) |
| Headings (H1) | Outfit | 1.75rem (28px) | 600 (SemiBold) |
| Headings (H2) | Outfit | 1.25rem (20px) | 500 (Medium) |
| Body text | Figtree | 1rem (16px) | 400 (Regular) |
| Labels/captions | Figtree | 0.875rem (14px) | 400 (Regular) |
| Small text | Figtree | 0.75rem (12px) | 400 (Regular) |

---

## Spacing & Layout

| Property | Value |
|----------|-------|
| Border radius | `0.75rem` (12px) default |
| Card padding | `1.5rem` (24px) |
| Section gap | `1.5rem` (24px) |
| Component gap | `0.75rem` (12px) |
| Max content width | `28rem` (448px) — mobile-first |
| Box shadow (light) | `0 2px 12px rgba(139, 115, 85, 0.08)` |
| Box shadow (dark) | `0 2px 12px rgba(0, 0, 0, 0.3)` |

---

## Component Styling

- **Buttons**: Rounded, warm shadows, filled primary or outlined secondary
- **Toggles/Switches**: Smooth transition, primary color when active
- **Cards**: Linen/warm-gray background, subtle shadow, rounded corners
- **Dialogs**: Centered overlay, backdrop blur, warm-toned
- **Inputs**: Bottom border or rounded, warm accent on focus

---

## Tray Icon Assets

> Platform-specific icon requirements for system tray / menu bar. See `11-platform-verification-matrix.md` for full per-platform details.

| Platform | Format | Sizes | Color Mode |
|----------|--------|-------|------------|
| macOS | `.png` (template) | 22×22 @1x, 44×44 @2x | Monochrome (black + alpha) — macOS auto-inverts for dark |
| Windows | `.ico` (multi-res) | 16×16, 32×32, 48×48 in single `.ico` | Full color |
| Linux | `.png` | 22×22 @1x, 44×44 @2x | Full color |

**Rules:** Must be recognizable at 16×16. macOS template icons must be pure monochrome. Test in both light and dark system themes.

---

## UI States Specification

> **Resolves P14-029.** Every view must handle four states: loading, populated, empty, and error. AI agents MUST implement all four states for each view — do not render blank screens or unhandled promise rejections.

### State Definitions

| State | Visual | Behavior |
|-------|--------|----------|
| **Loading** | Skeleton screen matching the view's layout. No spinners. | Shown during initial IPC fetch. Duration typically <100ms (local SQLite). |
| **Populated** | Normal content rendering | Default state after successful data fetch |
| **Empty** | Centered illustration + message + CTA button | Shown when data fetch succeeds but returns zero items |
| **Error** | Inline error banner with retry button | Shown when IPC call fails. Toast also fires via `safeInvoke`. |

### Per-View States

| View | Empty Message | Empty CTA | Error Recovery |
|------|--------------|-----------|----------------|
| **Alarm List** | "No alarms yet" + alarm icon | "Create your first alarm" → opens create form | Retry `list_alarms` |
| **Groups List** | "No groups created" + folder icon | "Create a group" → opens group form | Retry `list_groups` |
| **History / Analytics** | "No alarm history" + chart icon | None (passive view) | Retry `list_alarm_events` |
| **Settings** | N/A (always has default values) | N/A | Retry `get_all_settings` |
| **Alarm Overlay** | N/A (only shown when alarm fires) | N/A | If dismiss/snooze IPC fails → show retry in overlay |

### Skeleton Screens

Use Tailwind `animate-pulse` on `bg-muted` rectangles matching the layout of each view:

```tsx
// Example: Alarm list skeleton
function AlarmListSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            <div className="h-3 w-16 bg-muted animate-pulse rounded" />
          </div>
          <div className="h-6 w-10 bg-muted animate-pulse rounded-full" />
        </div>
      ))}
    </div>
  );
}
```

### Error Handling Pattern

All IPC calls go through `safeInvoke` (see AI cheat sheet). On failure:
1. `safeInvoke` shows an error toast via `sonner`
2. The calling store sets `error` state with the error message
3. The view renders an inline error banner with a "Retry" button
4. Retry calls the same store action again

```typescript
// In useAlarmStore
fetchAlarms: async () => {
  set({ isLoading: true, error: null });
  const result = await safeInvoke<Alarm[]>('list_alarms');
  if (result) {
    set({ alarms: result, isLoading: false });
  } else {
    set({ isLoading: false, error: 'Failed to load alarms' });
  }
},
```

### Data Flow: IPC → Store → UI State

```
User opens app
  → useAlarmStore.fetchAlarms()
    → set({ isLoading: true })      → UI renders <AlarmListSkeleton />
    → invoke('list_alarms')
      ├─ success, 0 items            → UI renders <EmptyState />
      ├─ success, N items            → UI renders <AlarmList />
      └─ error                       → UI renders <ErrorBanner retry={fetchAlarms} />
```

### Optimistic Updates

The alarm app does NOT use optimistic updates. All mutations follow **server-confirmed** flow:
1. Call IPC command
2. Wait for Rust response
3. Update store with confirmed data
4. Re-render UI

**Why:** SQLite is local — IPC round-trips are <10ms. Optimistic updates add complexity (rollback logic, conflict handling) with negligible UX benefit for local databases.

### Cache Invalidation

No explicit cache invalidation is needed because:
- Stores fetch fresh data from SQLite on each action
- IPC events from Rust (`alarm-fired`, `settings-changed`) trigger store refreshes
- There is no remote server or stale-while-revalidate concern

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Global Design System | `../../../06-design-system/00-overview.md` |
| Theme Feature | `../02-features/09-theme-system.md` |
| Platform Verification Matrix | `./11-platform-verification-matrix.md` |
| Frontend State Management | `./06-tauri-architecture-and-framework-comparison.md` → Zustand Stores |
| Coding Guidelines | `../../../02-coding-guidelines/03-coding-guidelines-spec/` |
