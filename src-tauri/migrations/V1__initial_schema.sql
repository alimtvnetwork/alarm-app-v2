-- V1__initial_schema.sql
-- Core tables: Alarms, AlarmGroups, Settings, SnoozeState, AlarmEvents, Quotes, Webhooks

CREATE TABLE AlarmGroups (
  AlarmGroupId TEXT PRIMARY KEY,
  Name TEXT NOT NULL,
  Color TEXT NOT NULL DEFAULT '#6366F1',
  Position INTEGER NOT NULL DEFAULT 0,
  IsEnabled INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE Alarms (
  AlarmId TEXT PRIMARY KEY,
  Time TEXT NOT NULL,
  Date TEXT,
  Label TEXT NOT NULL DEFAULT '',
  IsEnabled INTEGER NOT NULL DEFAULT 1,
  IsPreviousEnabled INTEGER,
  RepeatType TEXT NOT NULL DEFAULT 'Once',
  RepeatDaysOfWeek TEXT NOT NULL DEFAULT '[]',
  RepeatIntervalMinutes INTEGER NOT NULL DEFAULT 0,
  RepeatCronExpression TEXT NOT NULL DEFAULT '',
  GroupId TEXT REFERENCES AlarmGroups(AlarmGroupId) ON DELETE SET NULL,
  SnoozeDurationMin INTEGER NOT NULL DEFAULT 5,
  MaxSnoozeCount INTEGER NOT NULL DEFAULT 3,
  SoundFile TEXT NOT NULL DEFAULT 'classic-beep',
  IsVibrationEnabled INTEGER NOT NULL DEFAULT 0,
  IsGradualVolume INTEGER NOT NULL DEFAULT 0,
  GradualVolumeDurationSec INTEGER NOT NULL DEFAULT 30,
  AutoDismissMin INTEGER NOT NULL DEFAULT 0,
  ChallengeType TEXT,
  ChallengeDifficulty TEXT,
  ChallengeShakeCount INTEGER,
  ChallengeStepCount INTEGER,
  NextFireTime TEXT,
  DeletedAt TEXT,
  CreatedAt TEXT NOT NULL,
  UpdatedAt TEXT NOT NULL
);

CREATE TABLE Settings (
  Key TEXT PRIMARY KEY,
  Value TEXT NOT NULL,
  ValueType TEXT NOT NULL DEFAULT 'String'
);

CREATE TABLE SnoozeState (
  AlarmId TEXT PRIMARY KEY REFERENCES Alarms(AlarmId) ON DELETE CASCADE,
  SnoozeUntil TEXT NOT NULL,
  SnoozeCount INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE AlarmEvents (
  AlarmEventId TEXT PRIMARY KEY,
  AlarmId TEXT REFERENCES Alarms(AlarmId) ON DELETE SET NULL,
  Type TEXT NOT NULL,
  FiredAt TEXT NOT NULL,
  DismissedAt TEXT,
  SnoozeCount INTEGER NOT NULL DEFAULT 0,
  ChallengeType TEXT,
  ChallengeSolveTimeSec REAL,
  SleepQuality INTEGER,
  Mood TEXT,
  AlarmLabelSnapshot TEXT NOT NULL DEFAULT '',
  AlarmTimeSnapshot TEXT NOT NULL DEFAULT '',
  Timestamp TEXT NOT NULL
);

CREATE TABLE Quotes (
  QuoteId TEXT PRIMARY KEY,
  Text TEXT NOT NULL,
  Author TEXT NOT NULL DEFAULT '',
  IsFavorite INTEGER NOT NULL DEFAULT 0,
  IsCustom INTEGER NOT NULL DEFAULT 0,
  CreatedAt TEXT NOT NULL
);

CREATE TABLE Webhooks (
  WebhookId TEXT PRIMARY KEY,
  AlarmId TEXT REFERENCES Alarms(AlarmId) ON DELETE CASCADE,
  Url TEXT NOT NULL,
  Payload TEXT,
  CreatedAt TEXT NOT NULL
);

-- Indexes for alarm engine performance
CREATE INDEX IdxAlarms_NextFireTime ON Alarms(NextFireTime) WHERE IsEnabled = 1 AND DeletedAt IS NULL;
CREATE INDEX IdxAlarms_GroupId ON Alarms(GroupId);
CREATE INDEX IdxAlarmEvents_AlarmId ON AlarmEvents(AlarmId);
CREATE INDEX IdxAlarmEvents_Timestamp ON AlarmEvents(Timestamp);

-- Default settings (seeded once via V1 migration)
INSERT INTO Settings (Key, Value, ValueType) VALUES
  ('Theme', 'System', 'String'),
  ('ThemeSkin', 'default', 'String'),
  ('AccentColor', '#8b7355', 'String'),
  ('TimeFormat', '12h', 'String'),
  ('DefaultSnoozeDuration', '5', 'Integer'),
  ('DefaultMaxSnoozeCount', '3', 'Integer'),
  ('DefaultSound', 'classic-beep', 'String'),
  ('AutoDismissMin', '15', 'Integer'),
  ('AutoLaunch', 'false', 'Boolean'),
  ('MinimizeToTray', 'true', 'Boolean'),
  ('Language', 'en', 'String'),
  ('EventRetentionDays', '90', 'Integer'),
  ('IsGradualVolumeEnabled', 'false', 'Boolean'),
  ('GradualVolumeDurationSec', '30', 'Integer'),
  ('SystemTimezone', '', 'String'),
  ('ExportWarningDismissed', 'false', 'Boolean');
