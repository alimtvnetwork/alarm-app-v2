/**
 * BedtimeReminderCard — Configure bedtime target and reminder offset.
 */

import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BedDouble, Bell } from "lucide-react";
import { useSettingsStore } from "@/stores/settings-store";

const BedtimeReminderCard = () => {
  const { t } = useTranslation();
  const settings = useSettingsStore((s) => s.settings);
  const updateSettings = useSettingsStore((s) => s.updateSettings);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-sm font-heading">
          <div className="flex items-center gap-2">
            <BedDouble className="h-4 w-4 text-primary" />
            {t("sleep.bedtimeReminder")}
          </div>
          <Switch
            checked={settings.BedtimeEnabled}
            onCheckedChange={(v) => updateSettings({ BedtimeEnabled: v })}
            aria-label={t("sleep.bedtimeReminder")}
          />
        </CardTitle>
      </CardHeader>

      {settings.BedtimeEnabled && (
        <CardContent className="flex flex-col gap-3">
          <div className="space-y-1.5">
            <Label className="font-body text-xs">{t("sleep.bedtime")}</Label>
            <input
              type="time"
              value={settings.BedtimeTime}
              onChange={(e) => updateSettings({ BedtimeTime: e.target.value })}
              className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="font-body text-xs flex items-center gap-1">
              <Bell className="h-3 w-3" />
              {t("sleep.remindBefore")}
            </Label>
            <Select
              value={String(settings.BedtimeReminderMinBefore)}
              onValueChange={(v) => updateSettings({ BedtimeReminderMinBefore: Number(v) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[15, 30, 45, 60].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n} min
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="font-body text-xs">{t("sleep.sleepGoal")}</Label>
            <Select
              value={String(settings.SleepGoalHours)}
              onValueChange={(v) => updateSettings({ SleepGoalHours: Number(v) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[6, 6.5, 7, 7.5, 8, 8.5, 9].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}h
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <p className="text-[11px] text-muted-foreground font-body">
            {t("sleep.bedtimeHint", {
              time: settings.BedtimeTime,
              reminder: settings.BedtimeReminderMinBefore,
            })}
          </p>
        </CardContent>
      )}
    </Card>
  );
};

export default BedtimeReminderCard;
