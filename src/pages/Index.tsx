/**
 * Index — Main clock page with analog clock, digital time, and alarm list.
 */

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import AnalogClock from "@/components/clock/AnalogClock";
import DigitalTime from "@/components/clock/DigitalTime";
import AlarmList from "@/components/alarm/AlarmList";
import AlarmForm from "@/components/alarm/AlarmForm";
import MissedAlarmBanner from "@/components/alarm/MissedAlarmBanner";
import { useAlarmStore } from "@/stores/alarm-store";
import { useSettingsStore } from "@/stores/settings-store";
import type { Alarm } from "@/types/alarm";

const Index = () => {
  const loadAlarms = useAlarmStore((s) => s.loadAlarms);
  const loadGroups = useAlarmStore((s) => s.loadGroups);
  const loadSettings = useSettingsStore((s) => s.loadSettings);
  const { t } = useTranslation();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAlarm, setEditingAlarm] = useState<Alarm | null>(null);

  useEffect(() => {
    loadAlarms();
    loadGroups();
    loadSettings();
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
    <div className="flex flex-col items-center gap-6">
      <MissedAlarmBanner />

      <div className="w-full rounded-xl bg-card p-6 shadow-sm">
        <div className="flex flex-col items-center gap-4">
          <AnalogClock />
          <DigitalTime />
        </div>
      </div>

      <div className="w-full">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-heading font-semibold text-muted-foreground uppercase tracking-wider">
            {t("clock.alarms")}
          </h2>
        </div>
        <AlarmList onEditAlarm={handleEdit} />
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

export default Index;
