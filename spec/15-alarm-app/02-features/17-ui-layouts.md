# UI Layouts

**Version:** 1.0.0  
**Updated:** 2026-04-11  
**AI Confidence:** High  
**Ambiguity:** None  
**Priority:** P0 — Must Have  
**Resolves:** AI-002, AI-003, AI-004

---

## Keywords

`ui`, `layout`, `settings`, `alarm-list`, `alarm-form`, `component-tree`, `responsive`

---

## Scoring

| Criterion | Status |
|-----------|--------|
| Version present | ✅ |
| Keywords present | ✅ |
| Cross-References present | ✅ |
| Acceptance Criteria present | ✅ |

---

## Purpose

Defines exact UI layouts, component hierarchies, section ordering, and responsive behavior for the three primary screens: Alarm List, Alarm Creation/Edit Form, and Settings. This eliminates AI guesswork on frontend layout decisions.

---

## 1. Alarm List Screen (AI-004)

### Layout Structure

```
┌─────────────────────────────────────┐
│  Header Bar                         │
│  ┌──────────────────────┬────────┐  │
│  │ Clock Display        │ [+] [⚙] │ │
│  │ (Current time, large)│        │  │
│  └──────────────────────┴────────┘  │
├─────────────────────────────────────┤
│  Group: "Morning" ▼  [toggle all]   │
│  ┌─────────────────────────────────┐│
│  │ ☰ 06:30  Wake Up     [toggle]  ││
│  │    Mon Tue Wed Thu Fri          ││
│  ├─────────────────────────────────┤│
│  │ ☰ 07:00  Gym          [toggle] ││
│  │    Daily                        ││
│  └─────────────────────────────────┘│
│                                     │
│  Group: "Work" ▼  [toggle all]      │
│  ┌─────────────────────────────────┐│
│  │ ☰ 08:45  Standup      [toggle] ││
│  │    Mon–Fri                      ││
│  └─────────────────────────────────┘│
│                                     │
│  Ungrouped ▼                        │
│  ┌─────────────────────────────────┐│
│  │ ☰ 14:00  Dentist      [toggle] ││
│  │    Apr 15 (Once)                ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

### Component Tree

```
<AlarmListPage>
  <HeaderBar>
    <ClockDisplay />          // Current time, Outfit font, 4rem
    <IconButton icon="plus" onClick={openCreateForm} aria-label="Create alarm" />
    <IconButton icon="settings" onClick={navigateToSettings} aria-label="Settings" />
  </HeaderBar>

  <AlarmGroupList>
    {groups.map(group => (
      <AlarmGroup key={group.AlarmGroupId}>
        <GroupHeader>
          <ChevronToggle isExpanded={group.isExpanded} />
          <GroupName>{group.Name}</GroupName>
          <GroupToggle isEnabled={group.isAllEnabled} onChange={toggleGroup} />
        </GroupHeader>
        {group.isExpanded && (
          <SortableContext items={group.alarms}>
            {group.alarms.map(alarm => (
              <AlarmCard key={alarm.AlarmId} alarm={alarm} />
            ))}
          </SortableContext>
        )}
      </AlarmGroup>
    ))}

    {/* Ungrouped alarms always shown last */}
    <AlarmGroup key="ungrouped">
      <GroupHeader>
        <ChevronToggle isExpanded />
        <GroupName className="text-muted-foreground">Ungrouped</GroupName>
      </GroupHeader>
      <SortableContext items={ungroupedAlarms}>
        {ungroupedAlarms.map(alarm => (
          <AlarmCard key={alarm.AlarmId} alarm={alarm} />
        ))}
      </SortableContext>
    </AlarmGroup>
  </AlarmGroupList>
</AlarmListPage>
```

### AlarmCard Layout

Each alarm card is a horizontal flex row inside a `bg-card` rounded container:

| Zone | Content | Width | Interaction |
|------|---------|-------|-------------|
| **Drag handle** | `☰` icon | 24px fixed | Drag to reorder (pointer) or `Space` → arrow keys (keyboard) |
| **Time** | `HH:MM` in Outfit 600 weight, 1.25rem | auto | — |
| **AM/PM badge** | Only shown when `Is24Hour === false` | auto | — |
| **Label + schedule** | Label in Figtree 400, schedule summary below in `text-muted-foreground` 0.875rem | flex-1 | Tap/click opens edit form |
| **Toggle switch** | shadcn `Switch` component | 40px fixed | `toggle_alarm` IPC |

### Sorting & Grouping Rules

| Rule | Detail |
|------|--------|
| Group order | Alphabetical by `Name`, "Ungrouped" always last |
| Alarm order within group | Ascending by `Time` (24h comparison) |
| Collapsed groups | Show group header only; alarm count badge: "(3 alarms)" |
| Empty groups | Show header with "(No alarms)" text, no collapse |
| Expand/collapse persistence | Stored in Zustand `useAlarmStore.expandedGroups: Set<string>`, NOT persisted to DB |

### Responsive Behavior

| Breakpoint | Behavior |
|------------|----------|
| < 448px (mobile) | Full-width, 16px horizontal padding |
| ≥ 448px | Centered, max-width `28rem` (448px) |

### Swipe Actions (Touch Only)

| Direction | Action | Visual |
|-----------|--------|--------|
| Swipe left | Reveal delete button (red `bg-destructive`) | 80px reveal zone |
| Swipe right | Reveal duplicate button (blue `bg-primary`) | 80px reveal zone |

---

## 2. Alarm Creation/Edit Form (AI-003)

### Layout Structure

The form is a **dialog** (shadcn `Dialog`) that opens over the alarm list. Not a separate page.

```
┌─────────────────────────────────────┐
│  Create Alarm              [Cancel] │
├─────────────────────────────────────┤
│                                     │
│  ┌─── Time Picker ───────────────┐  │
│  │      ◄ 06 : 30  AM ►         │  │
│  │    (scroll wheels or input)   │  │
│  └───────────────────────────────┘  │
│                                     │
│  Label  [________________________]  │
│                                     │
│  ── Repeat ──────────────────────   │
│  [Once] [Daily] [Weekly] [Custom]   │
│                                     │
│  {if Weekly:}                       │
│  [S] [M] [T] [W] [T] [F] [S]      │
│                                     │
│  {if Custom → Interval:}           │
│  Every [___] minutes                │
│                                     │
│  {if Custom → Cron:}               │
│  Cron: [_____________________]     │
│                                     │
│  ── Date (optional) ─────────────   │
│  [📅 Select date]                   │
│                                     │
│  ── Group ───────────────────────   │
│  [▾ Select group       ]           │
│                                     │
│  ── Sound ───────────────────────   │
│  [▾ Classic Beep       ] [▶ Play]  │
│                                     │
│  ── Snooze ──────────────────────   │
│  Duration: [5] min    Max: [3]      │
│                                     │
│  ── Advanced ─── (collapsible) ──   │
│  Gradual Volume     [toggle]        │
│    Duration: [30s ▾]                │
│  Vibration          [toggle]        │
│  Auto-Dismiss       [0] min         │
│  Challenge          [▾ None]        │
│    {if Math:} Difficulty [▾ Easy]   │
│    {if Shake:} Count [___]          │
│    {if Steps:} Count [___]          │
│                                     │
├─────────────────────────────────────┤
│              [Save Alarm]           │
└─────────────────────────────────────┘
```

### Component Tree

```
<Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
  <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>{isEdit ? "Edit Alarm" : "Create Alarm"}</DialogTitle>
    </DialogHeader>

    <Form {...form}>
      {/* Section 1: Time Picker — always visible */}
      <TimePicker
        value={form.watch("Time")}
        is24Hour={settings.Is24Hour}
        onChange={(time) => form.setValue("Time", time)}
      />

      {/* Section 2: Label — always visible */}
      <FormField name="Label" render={...}>
        <Input maxLength={100} placeholder="Alarm label (optional)" />
      </FormField>

      {/* Section 3: Repeat Pattern — always visible */}
      <RepeatSelector
        repeatType={form.watch("RepeatType")}
        onRepeatTypeChange={(rt) => form.setValue("RepeatType", rt)}
      >
        {/* Conditional children based on RepeatType */}
        <WeekdayPicker />       {/* RepeatType.Weekly */}
        <IntervalInput />       {/* RepeatType.Interval */}
        <CronInput />           {/* RepeatType.Cron */}
      </RepeatSelector>

      {/* Section 4: Date — visible when RepeatType === Once */}
      {form.watch("RepeatType") === RepeatType.Once && (
        <DatePicker value={form.watch("Date")} onChange={...} />
      )}

      {/* Section 5: Group — always visible */}
      <GroupSelector groups={groups} value={form.watch("GroupId")} onChange={...} />

      {/* Section 6: Sound — always visible */}
      <SoundSelector
        sounds={sounds}
        value={form.watch("SoundFile")}
        onChange={...}
        onPreview={playSound}
      />

      {/* Section 7: Snooze — always visible */}
      <SnoozeConfig
        duration={form.watch("SnoozeDurationMin")}
        maxCount={form.watch("MaxSnoozeCount")}
        onDurationChange={...}
        onMaxCountChange={...}
      />

      {/* Section 8: Advanced — collapsible, collapsed by default */}
      <Collapsible>
        <CollapsibleTrigger>Advanced Settings ▾</CollapsibleTrigger>
        <CollapsibleContent className="space-y-3">
          <GradualVolumeToggle />
          <VibrationToggle />
          <AutoDismissInput />
          <ChallengeSelector />
        </CollapsibleContent>
      </Collapsible>

      {/* Save button — sticky at bottom */}
      <DialogFooter className="sticky bottom-0 bg-background pt-3">
        <Button type="submit" className="w-full">
          {isEdit ? "Save Changes" : "Create Alarm"}
        </Button>
      </DialogFooter>
    </Form>
  </DialogContent>
</Dialog>
```

### Section Ordering & Conditional Visibility

| # | Section | Visibility | Condition |
|---|---------|------------|-----------|
| 1 | Time Picker | Always | — |
| 2 | Label | Always | — |
| 3 | Repeat Pattern | Always | Sub-fields change based on `RepeatType` |
| 4 | Date Picker | Conditional | Only when `RepeatType === RepeatType.Once` |
| 5 | Group | Always | Dropdown with groups + "No group" option |
| 6 | Sound | Always | Dropdown + preview play button |
| 7 | Snooze | Always | Duration slider + max count input |
| 8 | Advanced | Collapsible | Collapsed by default on create, expanded if any value is non-default on edit |

### Form Validation Display

| Field | Validation Trigger | Error Placement |
|-------|--------------------|-----------------|
| Time | On blur + on submit | Below time picker |
| Label | On blur (length check) | Below input |
| WeekdayPicker | On submit (≥1 day required) | Below day buttons |
| Interval | On blur (1–1440 range) | Below interval input |
| Cron | On blur (syntax check) | Below cron input |
| All others | On submit | Below respective field via `FormMessage` |

### Edit vs. Create Behavior

| Aspect | Create | Edit |
|--------|--------|------|
| Dialog title | "Create Alarm" | "Edit Alarm" |
| Pre-filled values | Defaults from Settings (snooze, sound, etc.) | Current alarm values |
| Save button text | "Create Alarm" | "Save Changes" |
| Advanced section | Collapsed | Expanded if any non-default value |
| Cancel behavior | Discard all | Discard changes, alarm unchanged |

---

## 3. Settings Screen (AI-002)

### Layout Structure

The Settings screen is a **separate view** (not a dialog) accessed via the gear icon on the alarm list header.

```
┌─────────────────────────────────────┐
│  [←] Settings                       │
├─────────────────────────────────────┤
│                                     │
│  ── Appearance ──────────────────   │
│  Theme          [Light|Dark|System] │
│  Accent Color   [● ● ● ● ● ●]     │
│                                     │
│  ── Clock ───────────────────────   │
│  Time Format    [12h | 24h]        │
│                                     │
│  ── Alarm Defaults ──────────────   │
│  Snooze Duration    [5] min         │
│  Default Sound      [▾ Classic Beep]│
│                                     │
│  ── System ──────────────────────   │
│  Launch at Startup  [toggle]        │
│  Minimize to Tray   [toggle]        │
│                                     │
│  ── Data ────────────────────────   │
│  History Retention  [90] days       │
│  Export Alarms      [Export ▾]      │
│  Import Alarms      [Import]        │
│                                     │
│  ── Language ────────────────────   │
│  Language           [▾ English]     │
│                                     │
│  ── About ───────────────────────   │
│  Version            1.0.0           │
│  Timezone           Asia/Kuala_Lumpur│
│                                     │
└─────────────────────────────────────┘
```

### Component Tree

```
<SettingsPage>
  <HeaderBar>
    <BackButton onClick={navigateToAlarmList} aria-label="Back to alarms" />
    <PageTitle>Settings</PageTitle>
  </HeaderBar>

  <ScrollArea className="flex-1">
    <div className="space-y-6 p-4 max-w-md mx-auto">

      {/* Section 1: Appearance */}
      <SettingsSection title="Appearance">
        <SettingsRow label="Theme">
          <SegmentedControl
            options={[ThemeMode.Light, ThemeMode.Dark, ThemeMode.System]}
            value={settings.Theme}
            onChange={(v) => updateSetting("Theme", v)}
          />
        </SettingsRow>
        <SettingsRow label="Accent Color">
          <ColorPicker
            colors={ACCENT_COLORS}
            value={settings.AccentColor}
            onChange={(v) => updateSetting("AccentColor", v)}
          />
        </SettingsRow>
      </SettingsSection>

      {/* Section 2: Clock */}
      <SettingsSection title="Clock">
        <SettingsRow label="Time Format">
          <SegmentedControl
            options={["12h", "24h"]}
            value={settings.Is24Hour ? "24h" : "12h"}
            onChange={(v) => updateSetting("TimeFormat", v)}
          />
        </SettingsRow>
      </SettingsSection>

      {/* Section 3: Alarm Defaults */}
      <SettingsSection title="Alarm Defaults">
        <SettingsRow label="Snooze Duration">
          <NumberStepper min={1} max={30} value={settings.DefaultSnoozeDurationMin}
            onChange={(v) => updateSetting("DefaultSnoozeDuration", v)} suffix="min" />
        </SettingsRow>
        <SettingsRow label="Default Sound">
          <SoundSelector value={settings.DefaultSound}
            onChange={(v) => updateSetting("DefaultSound", v)} />
        </SettingsRow>
      </SettingsSection>

      {/* Section 4: System */}
      <SettingsSection title="System">
        <SettingsRow label="Launch at Startup">
          <Switch checked={settings.AutoLaunch}
            onCheckedChange={(v) => updateSetting("AutoLaunch", v)} />
        </SettingsRow>
        <SettingsRow label="Minimize to Tray">
          <Switch checked={settings.MinimizeToTray}
            onCheckedChange={(v) => updateSetting("MinimizeToTray", v)} />
        </SettingsRow>
      </SettingsSection>

      {/* Section 5: Data */}
      <SettingsSection title="Data">
        <SettingsRow label="History Retention">
          <NumberStepper min={7} max={365} value={settings.EventRetentionDays}
            onChange={(v) => updateSetting("EventRetentionDays", v)} suffix="days" />
        </SettingsRow>
        <SettingsRow label="Export Alarms">
          <ExportButton />
        </SettingsRow>
        <SettingsRow label="Import Alarms">
          <ImportButton />
        </SettingsRow>
      </SettingsSection>

      {/* Section 6: Language */}
      <SettingsSection title="Language">
        <SettingsRow label="Language">
          <LanguageSelector value={settings.Language}
            onChange={(v) => updateSetting("Language", v)} />
        </SettingsRow>
      </SettingsSection>

      {/* Section 7: About (read-only) */}
      <SettingsSection title="About">
        <SettingsRow label="Version">
          <span className="text-muted-foreground">1.0.0</span>
        </SettingsRow>
        <SettingsRow label="Timezone">
          <span className="text-muted-foreground">{settings.SystemTimezone}</span>
        </SettingsRow>
      </SettingsSection>

    </div>
  </ScrollArea>
</SettingsPage>
```

### SettingsRow Component Pattern

Every setting follows the same row layout:

```
┌───────────────────────────────────────┐
│  Label                    [Control]   │
│  (optional description)               │
└───────────────────────────────────────┘
```

```tsx
interface SettingsRowProps {
  label: string;
  description?: string;
  children: React.ReactNode;  // The control (switch, dropdown, stepper, etc.)
}

function SettingsRow({ label, description, children }: SettingsRowProps) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <span className="text-sm font-medium">{label}</span>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      <div className="ml-4 shrink-0">{children}</div>
    </div>
  );
}
```

### SettingsSection Component Pattern

```tsx
interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <div>
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
        {title}
      </h2>
      <Card>
        <CardContent className="divide-y divide-border p-0">
          {children}
        </CardContent>
      </Card>
    </div>
  );
}
```

### Settings Keys → UI Mapping

| Settings Key | Section | Control Type | Notes |
|-------------|---------|-------------|-------|
| `Theme` | Appearance | `SegmentedControl` (3 options) | Uses `ThemeMode` enum |
| `AccentColor` | Appearance | `ColorPicker` (6 presets) | Hex color circles |
| `TimeFormat` | Clock | `SegmentedControl` (2 options) | "12h" / "24h" |
| `DefaultSnoozeDuration` | Alarm Defaults | `NumberStepper` | Range 1–30, suffix "min" |
| `DefaultSound` | Alarm Defaults | `SoundSelector` dropdown | Same component as alarm form |
| `AutoLaunch` | System | `Switch` | Boolean toggle |
| `MinimizeToTray` | System | `Switch` | Boolean toggle |
| `EventRetentionDays` | Data | `NumberStepper` | Range 7–365, suffix "days" |
| `Language` | Language | `Select` dropdown | i18n locale codes |
| `SystemTimezone` | About | Read-only text | Auto-detected, not editable |

### Settings IPC Flow

```
User changes a setting
  → updateSetting("Theme", "Dark")
  → invoke("update_setting", { Key: "Theme", Value: "Dark" })
  → Rust validates + writes to SQLite
  → Rust emits "settings-changed" event
  → useSettingsStore listens → refreshes all settings
  → UI re-renders with new value
```

**No Save button.** Each setting change is saved immediately via IPC. Changes are atomic — one key at a time.

---

## Shared UI Components

### SegmentedControl

A pill-style toggle with 2–3 options, used for Theme and Time Format:

```tsx
interface SegmentedControlProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}
```

Visual: Rounded container with `bg-muted`, active segment has `bg-primary text-primary-foreground` with smooth transition.

### NumberStepper

A compact input with [−] and [+] buttons:

```tsx
interface NumberStepperProps {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
}
```

Visual: `[−] 5 min [+]` — buttons are 32×32px, value centered, suffix in `text-muted-foreground`.

### ColorPicker

A row of 6 color circles for accent color selection:

```tsx
const ACCENT_COLORS = [
  "#8b7355", // Warm brown (default)
  "#6366F1", // Indigo
  "#EC4899", // Pink
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#6B7280", // Gray
];
```

Visual: 28×28px circles, selected has a 2px `ring-primary` outline + checkmark.

---

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Alarm list with 0 groups, 0 alarms | Show empty state from `02-design-system.md` — "No alarms yet" + CTA |
| Alarm list with groups but all empty | Show group headers with "(No alarms)" text, no collapse |
| Form opened while alarm is firing | Allow editing — changes apply after current firing cycle |
| Settings opened while offline/DB locked | Show error banner with retry, per `02-design-system.md` error state |
| Very long alarm label in list card | Truncate with `text-ellipsis overflow-hidden` at 1 line |
| 50+ alarms in a single group | Virtualized list not needed (max ~200 alarms total expected). Standard scroll. |
| Settings value rejected by backend | Revert UI to previous value, show toast with validation error |

---

## Acceptance Criteria

- [ ] Alarm list displays alarms grouped by `AlarmGroup`, sorted by time within each group
- [ ] Groups are collapsible with chevron toggle; expand/collapse state is preserved in Zustand
- [ ] "Ungrouped" section always appears last
- [ ] Empty groups show "(No alarms)" text
- [ ] Alarm card shows drag handle, time, AM/PM (if 12h), label, schedule summary, and toggle switch
- [ ] Tapping/clicking an alarm card opens the edit form dialog
- [ ] Alarm form is a `Dialog` with sections in the defined order (Time → Label → Repeat → Date → Group → Sound → Snooze → Advanced)
- [ ] Advanced section is collapsed by default on create, expanded if non-default values on edit
- [ ] Date picker only shown when `RepeatType === Once`
- [ ] Conditional challenge fields appear based on selected `ChallengeType`
- [ ] Settings screen has 7 sections in defined order (Appearance → Clock → Alarm Defaults → System → Data → Language → About)
- [ ] Each setting saves immediately via IPC — no Save button
- [ ] Settings changes trigger `settings-changed` event and UI refresh
- [ ] All three screens handle loading, populated, empty, and error states per `02-design-system.md`

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Design System (tokens, states) | `../01-fundamentals/02-design-system.md` |
| Data Model (Settings, Alarm) | `../01-fundamentals/01-data-model.md` |
| Alarm CRUD (IPC, payloads) | `./01-alarm-crud.md` |
| Alarm Groups | `./07-alarm-groups.md` |
| Theme System | `./09-theme-system.md` |
| Sound & Vibration | `./05-sound-and-vibration.md` |
| Dismissal Challenges | `./06-dismissal-challenges.md` |
| Gap Analysis (AI-002/003/004) | `../14-spec-issues/56-gap-analysis-phase-6.md` |
