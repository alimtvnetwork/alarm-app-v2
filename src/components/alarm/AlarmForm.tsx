/**
 * AlarmForm — Sheet-based create/edit form for alarms.
 */

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();

  const [time, setTime] = useState("07:00");
  const [label, setLabel] = useState("");
  const [repeatType, setRepeatType] = useState<RepeatType>(RepeatType.Once);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([]);
  const [snoozeDuration, setSnoozeDuration] = useState(5);
  const [maxSnooze, setMaxSnooze] = useState(3);
  const [soundFile, setSoundFile] = useState("classic-beep");
  const [isGradualVolume, setIsGradualVolume] = useState(false);
  const [gradualDuration, setGradualDuration] = useState(30);
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
      setGradualDuration(alarm.GradualVolumeDurationSec);
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
      setGradualDuration(30);
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
        GradualVolumeDurationSec: isGradualVolume ? gradualDuration : 30,
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
        GradualVolumeDurationSec: isGradualVolume ? gradualDuration : 30,
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
            {isEditing ? t("alarmForm.editAlarm") : t("alarmForm.newAlarm")}
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-5 py-4">
          <div className="flex flex-col items-center gap-2">
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full rounded-lg border border-input bg-card px-4 py-3 text-center text-4xl font-heading font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="font-body text-sm">{t("alarmForm.label")}</Label>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={t("alarmForm.labelPlaceholder")}
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label className="font-body text-sm">{t("alarmForm.repeat")}</Label>
            <Select
              value={repeatType}
              onValueChange={(v) => setRepeatType(v as RepeatType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={RepeatType.Once}>{t("alarmForm.once")}</SelectItem>
                <SelectItem value={RepeatType.Daily}>{t("alarmForm.daily")}</SelectItem>
                <SelectItem value={RepeatType.Weekly}>{t("alarmForm.weekly")}</SelectItem>
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

          <div className="space-y-1.5">
            <Label className="font-body text-sm">{t("alarmForm.sound")}</Label>
            <Select value={soundFile} onValueChange={setSoundFile}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="classic-beep">{t("alarmForm.classicBeep")}</SelectItem>
                <SelectItem value="gentle-chime">{t("alarmForm.gentleChime")}</SelectItem>
                <SelectItem value="nature-birds">{t("alarmForm.birds")}</SelectItem>
                <SelectItem value="digital-pulse">{t("alarmForm.digitalPulse")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="font-body text-sm">{t("alarmForm.gradualVolume")}</Label>
              <Switch checked={isGradualVolume} onCheckedChange={setIsGradualVolume} />
            </div>
            {isGradualVolume && (
              <Select
                value={String(gradualDuration)}
                onValueChange={(v) => setGradualDuration(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[15, 30, 60].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}s {t("alarmForm.rampDuration")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="font-body text-xs">{t("alarmForm.snoozeMin")}</Label>
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
              <Label className="font-body text-xs">{t("alarmForm.maxSnoozes")}</Label>
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
                      {n === 0 ? t("alarmForm.noSnooze") : String(n)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-body text-sm">{t("alarmForm.challenge")}</Label>
            <Select
              value={challengeType}
              onValueChange={(v) => setChallengeType(v as ChallengeType | "none")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t("alarmForm.none")}</SelectItem>
                <SelectItem value={ChallengeType.Math}>{t("alarmForm.mathProblem")}</SelectItem>
                <SelectItem value={ChallengeType.Shake}>{t("alarmForm.shakePhone")}</SelectItem>
                <SelectItem value={ChallengeType.Typing}>{t("alarmForm.typing")}</SelectItem>
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
                  <SelectItem value={ChallengeDifficulty.Easy}>{t("alarmForm.easy")}</SelectItem>
                  <SelectItem value={ChallengeDifficulty.Medium}>{t("alarmForm.medium")}</SelectItem>
                  <SelectItem value={ChallengeDifficulty.Hard}>{t("alarmForm.hard")}</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <SheetFooter className="flex gap-2 pt-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            {t("alarmForm.cancel")}
          </Button>
          <Button onClick={handleSave} className="flex-1">
            {isEditing ? t("alarmForm.save") : t("alarmForm.create")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default AlarmForm;
