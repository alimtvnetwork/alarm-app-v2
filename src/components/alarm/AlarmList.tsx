/**
 * AlarmList — Sortable list with group section headers, colored dots, and undo toast.
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
import type { Alarm, AlarmGroup } from "@/types/alarm";
import AlarmCard from "./AlarmCard";
import { toast } from "sonner";
import { useCallback } from "react";

interface AlarmListProps {
  onEditAlarm: (alarm: Alarm) => void;
}

const AlarmList = ({ onEditAlarm }: AlarmListProps) => {
  const alarms = useAlarmStore((s) => s.alarms);
  const groups = useAlarmStore((s) => s.groups);
  const reorderAlarms = useAlarmStore((s) => s.reorderAlarms);
  const deleteAlarm = useAlarmStore((s) => s.deleteAlarm);
  const addAlarm = useAlarmStore((s) => s.addAlarm);

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

  const handleDelete = useCallback(
    (alarm: Alarm) => {
      deleteAlarm(alarm.AlarmId);
      toast(`"${alarm.Label || alarm.Time}" deleted`, {
        action: {
          label: "Undo",
          onClick: () => {
            addAlarm({ ...alarm, AlarmId: undefined as unknown as string });
          },
        },
        duration: 5000,
      });
    },
    [deleteAlarm, addAlarm]
  );

  if (alarms.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
        <p className="text-sm font-body">No alarms yet</p>
        <p className="text-xs">Tap + to create one</p>
      </div>
    );
  }

  // Group alarms by GroupId
  const groupedAlarms = new Map<string | null, Alarm[]>();
  for (const alarm of alarms) {
    const key = alarm.GroupId;
    const list = groupedAlarms.get(key) ?? [];
    list.push(alarm);
    groupedAlarms.set(key, list);
  }

  const groupMap = new Map(groups.map((g) => [g.AlarmGroupId, g]));

  // Sort: grouped alarms first (by group position), ungrouped last
  const sortedGroupKeys = Array.from(groupedAlarms.keys()).sort((a, b) => {
    if (a === null) return 1;
    if (b === null) return -1;
    const ga = groupMap.get(a);
    const gb = groupMap.get(b);
    return (ga?.Position ?? 0) - (gb?.Position ?? 0);
  });

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
        <div className="flex flex-col gap-3">
          {sortedGroupKeys.map((groupId) => {
            const group = groupId ? groupMap.get(groupId) : undefined;
            const groupAlarms = groupedAlarms.get(groupId) ?? [];

            return (
              <div key={groupId ?? "ungrouped"} className="flex flex-col gap-2">
                {/* Group section header */}
                {group && (
                  <div className="flex items-center gap-2 px-1 pt-1">
                    <div
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: group.Color }}
                    />
                    <span className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wider">
                      {group.Name}
                    </span>
                  </div>
                )}

                {groupAlarms.map((alarm) => (
                  <AlarmCard
                    key={alarm.AlarmId}
                    alarm={alarm}
                    group={group}
                    onEdit={onEditAlarm}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default AlarmList;
