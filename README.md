# Alarm App

A warm, minimal alarm clock web app with smart scheduling, sleep tools, and wellness tracking.

Built with **React 18 · TypeScript · Vite 5 · Tailwind CSS · Zustand · shadcn/ui**.

---

## Features

- ⏰ Create, edit, delete, toggle, duplicate, and drag-to-reorder alarms
- 🔁 Repeat patterns: Once, Daily, Weekly
- 🔊 4 alarm tones (oscillator-based) with gradual volume ramp
- 🧮 Dismissal challenges: Math & Typing
- 😴 Snooze with configurable duration and max count
- 🔔 OS-level browser notifications (background tab support)
- 🌙 Sleep tracking, bedtime reminders, ambient sounds
- 📊 Analytics dashboard with streak tracking
- 🎨 Theming: light/dark/system, accent color, i18n (EN/MS/ZH/JA)
- 📱 Installable as PWA (Add to Dock on macOS)
- 🕐 Timezone-aware scheduling (defaults to Asia/Kuala_Lumpur)

---

## Prerequisites

- **Node.js** ≥ 18 (recommended: 20 LTS)
- **npm** ≥ 9 (or use **bun** / **pnpm**)
- **VS Code** (recommended) with extensions:
  - ESLint
  - Tailwind CSS IntelliSense
  - Prettier (optional)

---

## Quick Start

```bash
# 1. Clone the repository
git clone <your-repo-url> alarm-app
cd alarm-app

# 2. Install dependencies
npm install

# 3. Copy environment file (no secrets needed)
cp .env.example .env

# 4. Start dev server
npm run dev
```

The app will open at **http://localhost:8080**.

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Vitest tests |
| `npm run test:watch` | Run Vitest in watch mode |

---

## Project Structure

```
src/
├── components/       # React components
│   ├── alarm/        # AlarmCard, AlarmForm, AlarmOverlay, AlarmChecker
│   ├── clock/        # AnalogClock, DigitalTime
│   ├── sleep/        # BedtimeReminder, AmbientPlayer
│   └── ui/           # shadcn/ui primitives
├── lib/              # Utilities
│   ├── alarm-audio.ts        # Web Audio oscillator tones
│   ├── alarm-notification.ts # Browser Notification API
│   ├── alarm-timezone.ts     # Timezone normalization
│   ├── next-fire-time.ts     # NextFireTime computation
│   ├── mock-ipc.ts           # localStorage persistence layer
│   └── ...
├── pages/            # Route pages (Index, Alarms, Sleep, Analytics, Settings)
├── stores/           # Zustand stores (alarm, overlay, settings)
├── types/            # TypeScript interfaces & enums
├── test/             # Test fixtures
└── i18n/             # Translation files
```

---

## Testing Alarms Locally

1. Navigate to **/alarms** and create a new alarm
2. Set the time to 1–2 minutes from now
3. The **Debug Panel** (dev mode only) at the bottom shows:
   - Your configured timezone
   - Local time vs UTC
   - Each alarm's computed `NextFireTime`
   - A "⚡ DUE" indicator when an alarm is past due
4. When the alarm fires:
   - Full-screen overlay with snooze/dismiss buttons
   - Audio tone plays (oscillator-based)
   - OS notification appears (if permission granted)
5. Allow browser notification permission when prompted

---

## Production Build

```bash
npm run build
```

Output goes to `dist/`. Serve with any static file server:

```bash
npm run preview          # Vite's built-in preview server
# — or —
npx serve dist           # Using the 'serve' package
```

---

## Data Persistence

Currently uses **localStorage** — data persists in-browser but is not synced across devices. Clearing browser data will reset all alarms and settings.

---

## License

Private — all rights reserved.