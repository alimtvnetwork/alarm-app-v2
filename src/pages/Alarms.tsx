/**
 * Alarms — Full-width alarm management page.
 * All features (create, duplicate, delete, toggle, drag & drop) work directly in the UI.
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
    <div className="mx-auto max-w-lg">
      {/* Alarm card */}
      <div className="rounded-2xl bg-card shadow-md overflow-hidden border border-border/50">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border/30">
          <h2 className="text-lg font-heading font-bold text-foreground">
            {t("alarms.title")}
          </h2>
          <button
            onClick={handleNew}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground hover:shadow-sm active:scale-95"
            aria-label={t("alarms.add")}
          >
            <Plus className="h-4.5 w-4.5" strokeWidth={2} />
          </button>
        </div>

        {/* Alarm list */}
        <div className="px-3 py-3">
          <AlarmList onEditAlarm={handleEdit} />
        </div>
      </div>

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
