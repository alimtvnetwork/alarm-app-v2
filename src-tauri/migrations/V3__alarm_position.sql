-- Add Position column to Alarms for persistent drag-drop ordering

ALTER TABLE Alarms ADD COLUMN Position INTEGER NOT NULL DEFAULT 0;

-- Initialize positions based on CreatedAt order
UPDATE Alarms SET Position = (
  SELECT COUNT(*) FROM Alarms AS a2
  WHERE a2.CreatedAt < Alarms.CreatedAt
    OR (a2.CreatedAt = Alarms.CreatedAt AND a2.AlarmId < Alarms.AlarmId)
);
