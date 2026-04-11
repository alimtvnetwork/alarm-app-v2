/**
 * AlarmForm — Sheet-based create/edit form for alarms.
 * Covers time, label, repeat, sound, snooze, challenge settings.
 */

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Alarm } from "@/types/alarm";
import {
  RepeatType,
  ChallengeType,
  ChallengeDifficulty,
  DEFAULT_REPEAT_PATTERN,
} from "@/types/alarm";
import { useAlarmStore } from "@/stores/alarm-store";

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];
const DAY_FULL = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface AlarmFormProps {
  alarm: Alarm | null;
  isOpen: boolean;
  onClose: () => void;
}

const AlarmForm = ({ alarm, isOpen, onClose }: AlarmFormProps) => {
  const addAlarm = useAlarmStore((s) => s.addAlarm);
  const updateAlarm = useAlarmStore((s) => s.updateAlarm);
  const isEditing = alarm !== null;

  // Form state
  const [time, setTime] = useState("07:00");
  const [label, setLabel] = useState("");
  const [repeatType, setRepeatType] = useState<RepeatType>(RepeatType.Once);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([]);
  const [snoozeDuration, setSnoozeDuration] = useState(5);
  const [maxSnooze, setMaxSnooze] = useState(3);
  const [soundFile, setSoundFile] = useState("classic-beep");
  const [isGradualVolume, setIsGradualVolume] = useState(false);
  const [challengeType, setChallengeType] = useState<ChallengeType | "none">("none");
  const [challengeDifficulty, setChallengeDifficulty] = useState<ChallengeDifficulty>(
    ChallengeDifficulty.Easy
  );

  useEffect(() => {
    if (alarm) {
      setTime(alarm.Time);
      setLabel(alarm.Label);
      setRepeatType(alarm.Repeat.Type);
      setDaysOfWeek(alarm.Repeat.DaysOfWeek);
      setSnoozeDuration(alarm.SnoozeDurationMin);
      setMaxSnooze(alarm.MaxSnoozeCount);
      setSoundFile(alarm.SoundFile);
      setIsGradualVolume(alarm.IsGradualVolume);
      setChallengeType(alarm.ChallengeType ?? "none");
      setChallengeDifficulty(alarm.ChallengeDifficulty ?? ChallengeDifficulty.Easy);
    } else {
      setTime("07:00");
      setLabel("");
      setRepeatType(RepeatType.Once);
      setDaysOfWeek([]);
      setSnoozeDuration(5);
      setMaxSnooze(3);
      setSoundFile("classic-beep");
      setIsGradualVolume(false);
      setChallengeType("none");
      setChallengeDifficulty(ChallengeDifficulty.Easy);
    }
  }, [alarm, isOpen]);

  const toggleDay = (day: number) => {
    setDaysOfWeek((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  const handleSave = () => {
    const repeatPattern = {
      Type: repeatType,
      DaysOfWeek: repeatType === RepeatType.Weekly ? daysOfWeek : [],
      IntervalMinutes: 0,
      CronExpression: "",
    };

    if (isEditing && alarm) {
      updateAlarm({
        ...alarm,
        Time: time,
        Label: label,
        Repeat: repeatPattern,
        SnoozeDurationMin: snoozeDuration,
        MaxSnoozeCount: maxSnooze,
        SoundFile: soundFile,
        IsGradualVolume: isGradualVolume,
        ChallengeType: challengeType === "none" ? null : challengeType,
        ChallengeDifficulty:
          challengeType === ChallengeType.Math ? challengeDifficulty : null,
        UpdatedAt: new Date().toISOString(),
      });
    } else {
      addAlarm({
        Time: time,
        Label: label,
        Repeat: repeatPattern,
        SnoozeDurationMin: snoozeDuration,
        MaxSnoozeCount: maxSnooze,
        SoundFile: soundFile,
        IsGradualVolume: isGradualVolume,
        ChallengeType: challengeType === "none" ? null : challengeType,
        ChallengeDifficulty:
          challengeType === ChallengeType.Math ? challengeDifficulty : null,
      });
    }
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-2xl">
        <SheetHeader>
          <SheetTitle className="font-heading">
            {isEditing ? "Edit Alarm" : "New Alarm"}
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-5 py-4">
          {/* Time picker */}
          <div className="flex flex-col items-center gap-2">
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full rounded-lg border border-input bg-card px-4 py-3 text-center text-4xl font-heading font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Label */}
          <div className="space-y-1.5">
            <Label className="font-body text-sm">Label</Label>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Alarm name"
              maxLength={100}
            />
          </div>

          {/* Repeat */}
          <div className="space-y-2">
            <Label className="font-body text-sm">Repeat</Label>
            <Select
              value={repeatType}
              onValueChange={(v) => setRepeatType(v as RepeatType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={RepeatType.Once}>Once</SelectItem>
                <SelectItem value={RepeatType.Daily}>Daily</SelectItem>
                <SelectItem value={RepeatType.Weekly}>Weekly</SelectItem>
              </SelectContent>
            </Select>

            {repeatType === RepeatType.Weekly && (
              <div className="flex gap-1 pt-1">
                {DAY_LABELS.map((d, i) => (
                  <button
                    key={i}
                    onClick={() => toggleDay(i)}
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-body font-medium transition-colors ${
                      daysOfWeek.includes(i)
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground"
                    }`}
                    aria-label={DAY_FULL[i]}
                    aria-pressed={daysOfWeek.includes(i)}
                  >
                    {d}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sound */}
          <div className="space-y-1.5">
            <Label className="font-body text-sm">Sound</Label>
            <Select value={soundFile} onValueChange={setSoundFile}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="classic-beep">Classic Beep</SelectItem>
                <SelectItem value="gentle-chime">Gentle Chime</SelectItem>
                <SelectItem value="nature-birds">Birds</SelectItem>
                <SelectItem value="digital-pulse">Digital Pulse</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Gradual volume */}
          <div className="flex items-center justify-between">
            <Label className="font-body text-sm">Gradual Volume</Label>
            <Switch checked={isGradualVolume} onCheckedChange={setIsGradualVolume} />
          </div>

          {/* Snooze */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="font-body text-xs">Snooze (min)</Label>
              <Select
                value={String(snoozeDuration)}
                onValueChange={(v) => setSnoozeDuration(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 3, 5, 10, 15, 20, 30].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n} min
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="font-body text-xs">Max Snoozes</Label>
              <Select
                value={String(maxSnooze)}
                onValueChange={(v) => setMaxSnooze(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[0, 1, 2, 3, 5, 10].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n === 0 ? "No snooze" : String(n)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Challenge */}
          <div className="space-y-2">
            <Label className="font-body text-sm">Dismiss Challenge</Label>
            <Select
              value={challengeType}
              onValueChange={(v) => setChallengeType(v as ChallengeType | "none")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value={ChallengeType.Math}>Math Problem</SelectItem>
                <SelectItem value={ChallengeType.Shake}>Shake Phone</SelectItem>
                <SelectItem value={ChallengeType.Typing}>Typing</SelectItem>
              </SelectContent>
            </Select>

            {challengeType === ChallengeType.Math && (
              <Select
                value={challengeDifficulty}
                onValueChange={(v) =>
                  setChallengeDifficulty(v as ChallengeDifficulty)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ChallengeDifficulty.Easy}>Easy</SelectItem>
                  <SelectItem value={ChallengeDifficulty.Medium}>Medium</SelectItem>
                  <SelectItem value={ChallengeDifficulty.Hard}>Hard</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <SheetFooter className="flex gap-2 pt-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex-1">
            {isEditing ? "Save" : "Create"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default AlarmForm;
