# Design System

**Version:** 1.0.0  
**Updated:** 2026-04-08  
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

## Cross-References

| Reference | Location |
|-----------|----------|
| Global Design System | `../../../06-design-system/00-overview.md` |
| Theme Feature | `../02-features/09-theme-system.md` |
