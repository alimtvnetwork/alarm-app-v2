/**
 * Alarms — Dedicated alarm management page with grouped list,
 * drag-and-drop reordering, and undo-delete toast.
 */

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import AlarmList from "@/components/alarm/AlarmList";
import AlarmForm from "@/components/alarm/AlarmForm";
import { useAlarmStore } from "@/stores/alarm-store";
import type { Alarm } from "@/types/alarm";

const Alarms = () => {
  const loadAlarms = useAlarmStore((s) => s.loadAlarms);
  const loadGroups = useAlarmStore((s) => s.loadGroups);
  const { t } = useTranslation();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAlarm, setEditingAlarm] = useState<Alarm | null>(null);

  useEffect(() => {
    loadAlarms();
    loadGroups();
  }, []);

  const handleEdit = (alarm: Alarm) => {
    setEditingAlarm(alarm);
    setIsFormOpen(true);
  };

  const handleNew = () => {
    setEditingAlarm(null);
    setIsFormOpen(true);
  };

  useEffect(() => {
    const handler = () => handleNew();
    window.addEventListener("alarm:new", handler);
    return () => window.removeEventListener("alarm:new", handler);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-heading font-bold">{t("alarms.title")}</h1>
        <button
          onClick={handleNew}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-body text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          {t("alarms.add")}
        </button>
      </div>

      <AlarmList onEditAlarm={handleEdit} />

      <AlarmForm
        alarm={editingAlarm}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingAlarm(null);
        }}
      />
    </div>
  );
};

export default Alarms;
