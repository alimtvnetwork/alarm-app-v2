/**
 * AlarmCard — Single alarm item with toggle, label, time, repeat info.
 * Used inside AlarmList. Supports drag handle via dnd-kit.
 */

import { GripVertical, Trash2 } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import type { Alarm, AlarmGroup } from "@/types/alarm";
import { RepeatType } from "@/types/alarm";
import { useAlarmStore } from "@/stores/alarm-store";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatRepeat(alarm: Alarm): string {
  const { Repeat } = alarm;
  switch (Repeat.Type) {
    case RepeatType.Daily:
      return "Every day";
    case RepeatType.Weekly: {
      if (Repeat.DaysOfWeek.length === 7) return "Every day";
      if (
        Repeat.DaysOfWeek.length === 5 &&
        [1, 2, 3, 4, 5].every((d) => Repeat.DaysOfWeek.includes(d))
      ) {
        return "Weekdays";
      }
      if (
        Repeat.DaysOfWeek.length === 2 &&
        Repeat.DaysOfWeek.includes(0) &&
        Repeat.DaysOfWeek.includes(6)
      ) {
        return "Weekends";
      }
      return Repeat.DaysOfWeek.map((d) => DAY_LABELS[d]).join(", ");
    }
    case RepeatType.Interval:
      return `Every ${Repeat.IntervalMinutes} min`;
    case RepeatType.Cron:
      return "Custom schedule";
    default:
      return alarm.Date ?? "Once";
  }
}

interface AlarmCardProps {
  alarm: Alarm;
  group: AlarmGroup | undefined;
  onEdit: (alarm: Alarm) => void;
}

const AlarmCard = ({ alarm, group, onEdit }: AlarmCardProps) => {
  const toggleAlarm = useAlarmStore((s) => s.toggleAlarm);
  const deleteAlarm = useAlarmStore((s) => s.deleteAlarm);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: alarm.AlarmId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const is24Hour = false; // TODO: read from settings store
  const displayTime = (() => {
    const [h, m] = alarm.Time.split(":").map(Number);
    if (is24Hour) return alarm.Time;
    const h12 = h % 12 || 12;
    const period = h >= 12 ? "PM" : "AM";
    return `${h12}:${String(m).padStart(2, "0")} ${period}`;
  })();

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 rounded-lg bg-card p-3 transition-colors ${
        alarm.IsEnabled ? "" : "opacity-60"
      }`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="touch-none text-muted-foreground hover:text-foreground"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-5 w-5" />
      </button>

      {/* Group color indicator */}
      {group && (
        <div
          className="h-8 w-1 rounded-full"
          style={{ backgroundColor: group.Color }}
        />
      )}

      {/* Content — clickable to edit */}
      <button
        className="flex flex-1 flex-col items-start gap-0.5 text-left"
        onClick={() => onEdit(alarm)}
      >
        <span className="text-2xl font-heading font-semibold leading-tight text-foreground">
          {displayTime}
        </span>
        <span className="text-xs text-muted-foreground font-body">
          {alarm.Label && `${alarm.Label} · `}
          {formatRepeat(alarm)}
        </span>
      </button>

      {/* Toggle */}
      <Switch
        checked={alarm.IsEnabled}
        onCheckedChange={(checked) => toggleAlarm(alarm.AlarmId, checked)}
        aria-label={`Toggle ${alarm.Label || "alarm"}`}
      />

      {/* Delete */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-destructive"
        onClick={() => deleteAlarm(alarm.AlarmId)}
        aria-label="Delete alarm"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default AlarmCard;
