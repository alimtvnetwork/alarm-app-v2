/**
 * DigitalTime — Large digital time display with date.
 */

import { useEffect, useState } from "react";
import { useSettingsStore } from "@/stores/settings-store";

const DigitalTime = () => {
  const [now, setNow] = useState(new Date());
  const is24Hour = useSettingsStore((s) => s.settings.Is24Hour);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const formatTime = (date: Date): string => {
    const h = date.getHours();
    const m = date.getMinutes();
    if (is24Hour) {
      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    }
    const h12 = h % 12 || 12;
    return `${h12}:${String(m).padStart(2, "0")}`;
  };

  const period = is24Hour ? null : (now.getHours() >= 12 ? "PM" : "AM");

  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-baseline gap-1">
        <span className="text-5xl font-heading font-bold tracking-tight text-foreground">
          {formatTime(now)}
        </span>
        {period && (
          <span className="text-lg font-heading font-medium text-muted-foreground">
            {period}
          </span>
        )}
      </div>
      <p className="text-sm text-muted-foreground font-body">{dateStr}</p>
    </div>
  );
};

export default DigitalTime;
