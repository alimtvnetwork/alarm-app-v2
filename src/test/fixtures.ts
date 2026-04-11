/**
 * Test Fixtures — Mock data for development and testing.
 * Matches spec/15-alarm-app/01-fundamentals/01-data-model.md
 */

import {
  type Alarm,
  type AlarmGroup,
  type AlarmEvent,
  type AlarmSound,
  type Settings,
  RepeatType,
  ChallengeType,
  ChallengeDifficulty,
  AlarmEventType,
  SoundCategory,
  DEFAULT_REPEAT_PATTERN,
  DEFAULT_SETTINGS,
} from "@/types/alarm";

// ─── Alarm Groups ────────────────────────────────────────────────

export const MOCK_GROUPS: AlarmGroup[] = [
  {
    AlarmGroupId: "g-001",
    Name: "Weekday",
    Color: "#6366F1",
    Position: 0,
    IsEnabled: true,
  },
  {
    AlarmGroupId: "g-002",
    Name: "Weekend",
    Color: "#F59E0B",
    Position: 1,
    IsEnabled: true,
  },
];

// ─── Alarms ──────────────────────────────────────────────────────

const NOW = new Date().toISOString();

export const MOCK_ALARMS: Alarm[] = [
  {
    AlarmId: "a-001",
    Time: "07:00",
    Date: null,
    Label: "Wake Up",
    IsEnabled: true,
    IsPreviousEnabled: null,
    Repeat: {
      Type: RepeatType.Weekly,
      DaysOfWeek: [1, 2, 3, 4, 5],
      IntervalMinutes: 0,
      CronExpression: "",
    },
    GroupId: "g-001",
    SnoozeDurationMin: 5,
    MaxSnoozeCount: 3,
    SoundFile: "classic-beep",
    IsVibrationEnabled: true,
    IsGradualVolume: true,
    GradualVolumeDurationSec: 30,
    AutoDismissMin: 15,
    ChallengeType: ChallengeType.Math,
    ChallengeDifficulty: ChallengeDifficulty.Easy,
    ChallengeShakeCount: null,
    ChallengeStepCount: null,
    NextFireTime: null,
    DeletedAt: null,
    CreatedAt: NOW,
    UpdatedAt: NOW,
  },
  {
    AlarmId: "a-002",
    Time: "09:00",
    Date: null,
    Label: "Weekend Rise",
    IsEnabled: true,
    IsPreviousEnabled: null,
    Repeat: {
      Type: RepeatType.Weekly,
      DaysOfWeek: [0, 6],
      IntervalMinutes: 0,
      CronExpression: "",
    },
    GroupId: "g-002",
    SnoozeDurationMin: 10,
    MaxSnoozeCount: 5,
    SoundFile: "gentle-chime",
    IsVibrationEnabled: false,
    IsGradualVolume: true,
    GradualVolumeDurationSec: 60,
    AutoDismissMin: 0,
    ChallengeType: null,
    ChallengeDifficulty: null,
    ChallengeShakeCount: null,
    ChallengeStepCount: null,
    NextFireTime: null,
    DeletedAt: null,
    CreatedAt: NOW,
    UpdatedAt: NOW,
  },
  {
    AlarmId: "a-003",
    Time: "06:30",
    Date: "2026-04-15",
    Label: "Early Meeting",
    IsEnabled: true,
    IsPreviousEnabled: null,
    Repeat: { ...DEFAULT_REPEAT_PATTERN },
    GroupId: null,
    SnoozeDurationMin: 3,
    MaxSnoozeCount: 1,
    SoundFile: "digital-pulse",
    IsVibrationEnabled: true,
    IsGradualVolume: false,
    GradualVolumeDurationSec: 30,
    AutoDismissMin: 5,
    ChallengeType: ChallengeType.Shake,
    ChallengeDifficulty: null,
    ChallengeShakeCount: 20,
    ChallengeStepCount: null,
    NextFireTime: "2026-04-15T06:30:00+08:00",
    DeletedAt: null,
    CreatedAt: NOW,
    UpdatedAt: NOW,
  },
];

// ─── Sounds ──────────────────────────────────────────────────────

export const MOCK_SOUNDS: AlarmSound[] = [
  { AlarmSoundId: "classic-beep", Name: "Classic Beep", FileName: "classic-beep.mp3", Category: SoundCategory.Classic },
  { AlarmSoundId: "gentle-chime", Name: "Gentle Chime", FileName: "gentle-chime.mp3", Category: SoundCategory.Gentle },
  { AlarmSoundId: "nature-birds", Name: "Birds", FileName: "nature-birds.mp3", Category: SoundCategory.Nature },
  { AlarmSoundId: "digital-pulse", Name: "Digital Pulse", FileName: "digital-pulse.mp3", Category: SoundCategory.Digital },
];

// ─── Events ──────────────────────────────────────────────────────

export const MOCK_EVENTS: AlarmEvent[] = [
  {
    AlarmEventId: "e-001",
    AlarmId: "a-001",
    Type: AlarmEventType.Fired,
    FiredAt: "2026-04-10T07:00:00+08:00",
    DismissedAt: "2026-04-10T07:02:30+08:00",
    SnoozeCount: 0,
    ChallengeType: ChallengeType.Math,
    ChallengeSolveTimeSec: 8.5,
    SleepQuality: 4,
    Mood: "refreshed",
    AlarmLabelSnapshot: "Wake Up",
    AlarmTimeSnapshot: "07:00",
    Timestamp: "2026-04-10T07:00:00+08:00",
  },
  {
    AlarmEventId: "e-002",
    AlarmId: "a-001",
    Type: AlarmEventType.Snoozed,
    FiredAt: "2026-04-09T07:00:00+08:00",
    DismissedAt: "2026-04-09T07:12:00+08:00",
    SnoozeCount: 2,
    ChallengeType: ChallengeType.Math,
    ChallengeSolveTimeSec: 12.3,
    SleepQuality: 2,
    Mood: "tired",
    AlarmLabelSnapshot: "Wake Up",
    AlarmTimeSnapshot: "07:00",
    Timestamp: "2026-04-09T07:00:00+08:00",
  },
];

// ─── Settings ────────────────────────────────────────────────────

export const MOCK_SETTINGS: Settings = { ...DEFAULT_SETTINGS };
