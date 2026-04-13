/**
 * Alarms — Full-width alarm management page.
 * All features (create, duplicate, delete, toggle, drag & drop) work directly in the UI.
 */

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Bug } from "lucide-react";
import AlarmList from "@/components/alarm/AlarmList";
import AlarmForm from "@/components/alarm/AlarmForm";
import { useAlarmStore } from "@/stores/alarm-store";
import { useOverlayStore } from "@/stores/overlay-store";
import type { Alarm } from "@/types/alarm";
import { MOCK_ALARMS } from "@/test/fixtures";

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
      {/* DEV: Test alarm overlay */}
      <button
        onClick={() => useOverlayStore.getState().fireAlarm(MOCK_ALARMS[0])}
        className="mb-3 flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive hover:bg-destructive/20"
      >
        <Bug className="h-3 w-3" /> Test Alarm Overlay
      </button>

      {/* Alarm card */}
      <div className="rounded-2xl bg-card shadow-md overflow-hidden border border-border/50">
        {/* Dark header */}
        <div className="flex items-center justify-between rounded-t-2xl bg-foreground px-6 py-5">
          <h2 className="text-lg font-heading font-bold text-background">
            {t("alarms.title")}
          </h2>
          <button
            onClick={handleNew}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted-foreground/30 text-background/70 transition-all hover:bg-muted-foreground/50 hover:text-background active:scale-95"
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
