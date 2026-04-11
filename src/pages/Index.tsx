/**
 * Index — Main clock page with analog clock, digital time, and alarm list.
 */

import { useEffect, useState } from "react";
import AnalogClock from "@/components/clock/AnalogClock";
import DigitalTime from "@/components/clock/DigitalTime";
import AlarmList from "@/components/alarm/AlarmList";
import AlarmForm from "@/components/alarm/AlarmForm";
import { useAlarmStore } from "@/stores/alarm-store";
import { useSettingsStore } from "@/stores/settings-store";
import type { Alarm } from "@/types/alarm";

const Index = () => {
  const loadAlarms = useAlarmStore((s) => s.loadAlarms);
  const loadGroups = useAlarmStore((s) => s.loadGroups);
  const loadSettings = useSettingsStore((s) => s.loadSettings);

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

  // Expose handleNew globally for Header's + button
  useEffect(() => {
    const handler = () => handleNew();
    window.addEventListener("alarm:new", handler);
    return () => window.removeEventListener("alarm:new", handler);
  }, []);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Clock section */}
      <div className="flex flex-col items-center gap-3 pt-2">
        <AnalogClock />
        <DigitalTime />
      </div>

      {/* Alarm list */}
      <div className="w-full">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-heading font-semibold text-muted-foreground uppercase tracking-wider">
            Alarms
          </h2>
        </div>
        <AlarmList onEditAlarm={handleEdit} />
      </div>

      {/* Form sheet */}
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
