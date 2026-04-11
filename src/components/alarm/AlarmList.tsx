/**
 * AlarmList — Sortable list of alarm cards using @dnd-kit.
 */

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useAlarmStore } from "@/stores/alarm-store";
import type { Alarm } from "@/types/alarm";
import AlarmCard from "./AlarmCard";

interface AlarmListProps {
  onEditAlarm: (alarm: Alarm) => void;
}

const AlarmList = ({ onEditAlarm }: AlarmListProps) => {
  const alarms = useAlarmStore((s) => s.alarms);
  const groups = useAlarmStore((s) => s.groups);
  const reorderAlarms = useAlarmStore((s) => s.reorderAlarms);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const ids = alarms.map((a) => a.AlarmId);
    const oldIndex = ids.indexOf(active.id as string);
    const newIndex = ids.indexOf(over.id as string);
    if (oldIndex < 0 || newIndex < 0) return;

    const newIds = [...ids];
    newIds.splice(oldIndex, 1);
    newIds.splice(newIndex, 0, active.id as string);
    reorderAlarms(newIds);
  };

  if (alarms.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
        <p className="text-sm font-body">No alarms yet</p>
        <p className="text-xs">Tap + to create one</p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={alarms.map((a) => a.AlarmId)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-2">
          {alarms.map((alarm) => (
            <AlarmCard
              key={alarm.AlarmId}
              alarm={alarm}
              group={groups.find((g) => g.AlarmGroupId === alarm.GroupId)}
              onEdit={onEditAlarm}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default AlarmList;
