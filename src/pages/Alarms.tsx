/**
 * Alarms — Split-view alarm management page.
 * Left: feature documentation list. Right: interactive alarm UI.
 */

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import AlarmList from "@/components/alarm/AlarmList";
import AlarmForm from "@/components/alarm/AlarmForm";
import AlarmFeatureList from "@/components/alarm/AlarmFeatureList";
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
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
      {/* Left panel — Feature documentation */}
      <div className="flex flex-col gap-2">
        <AlarmFeatureList />
      </div>

      {/* Right panel — Interactive alarm UI */}
      <div className="flex flex-col gap-0">
        <div className="rounded-2xl bg-card shadow-sm overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4">
            <h2 className="text-base font-heading font-bold text-foreground">
              {t("alarms.title")}
            </h2>
            <button
              onClick={handleNew}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              aria-label={t("alarms.add")}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* Alarm list */}
          <div className="px-3 pb-4">
            <AlarmList onEditAlarm={handleEdit} />
          </div>
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
