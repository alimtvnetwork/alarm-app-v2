/**
 * AlarmList — Sortable list with group headers, colored dots, and undo toast.
 * Compact layout matching desktop alarm manager design.
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
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();

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
      toast(t("alarm.deleted", { name: alarm.Label || alarm.Time }), {
        action: {
          label: t("alarm.undo"),
          onClick: () => {
            addAlarm({ ...alarm, AlarmId: undefined as unknown as string });
          },
        },
        duration: 5000,
      });
    },
    [deleteAlarm, addAlarm, t]
  );

  if (alarms.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
        <p className="text-sm font-body">{t("clock.noAlarms")}</p>
        <p className="text-xs">{t("clock.tapToCreate")}</p>
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
        <div className="flex flex-col gap-1">
          {sortedGroupKeys.map((groupId) => {
            const group = groupId ? groupMap.get(groupId) : undefined;
            const groupAlarms = groupedAlarms.get(groupId) ?? [];

            return (
              <div key={groupId ?? "ungrouped"} className="flex flex-col">
                {/* Group section header */}
                {group && (
                  <div className="flex items-center gap-2 px-3 py-2">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: group.Color }}
                    />
                    <span className="text-xs font-body font-medium text-muted-foreground">
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
