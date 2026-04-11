/**
 * Settings Page — All 16 settings keys organized into sections.
 */

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSettingsStore } from "@/stores/settings-store";
import {
  Clock,
  Volume2,
  Bell,
  Globe,
  Shield,
  Laptop,
  Timer,
  Database,
} from "lucide-react";

const Settings = () => {
  const settings = useSettingsStore((s) => s.settings);
  const loadSettings = useSettingsStore((s) => s.loadSettings);
  const updateSettings = useSettingsStore((s) => s.updateSettings);

  useEffect(() => {
    loadSettings();
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-heading font-bold">Settings</h1>

      {/* Alarm Defaults */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-heading">
            <Bell className="h-4 w-4" />
            Alarm Defaults
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {/* Default Snooze Duration */}
          <div className="flex items-center justify-between">
            <Label className="font-body text-sm">Snooze Duration</Label>
            <Select
              value={String(settings.DefaultSnoozeDurationMin)}
              onValueChange={(v) => updateSettings({ DefaultSnoozeDurationMin: Number(v) })}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 3, 5, 10, 15, 20, 30].map((n) => (
                  <SelectItem key={n} value={String(n)}>{n} min</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Default Max Snooze Count */}
          <div className="flex items-center justify-between">
            <Label className="font-body text-sm">Max Snoozes</Label>
            <Select
              value={String(settings.DefaultMaxSnoozeCount)}
              onValueChange={(v) => updateSettings({ DefaultMaxSnoozeCount: Number(v) })}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[0, 1, 2, 3, 5, 10].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n === 0 ? "None" : String(n)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Auto-Dismiss */}
          <div className="flex items-center justify-between">
            <Label className="font-body text-sm">Auto-Dismiss</Label>
            <Select
              value={String(settings.AutoDismissMin)}
              onValueChange={(v) => updateSettings({ AutoDismissMin: Number(v) })}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Manual</SelectItem>
                {[1, 5, 10, 15, 30, 60].map((n) => (
                  <SelectItem key={n} value={String(n)}>{n} min</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Default Sound */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-muted-foreground" />
              <Label className="font-body text-sm">Default Sound</Label>
            </div>
            <Select
              value={settings.DefaultSound}
              onValueChange={(v) => updateSettings({ DefaultSound: v })}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="classic-beep">Classic Beep</SelectItem>
                <SelectItem value="gentle-chime">Gentle Chime</SelectItem>
                <SelectItem value="nature-birds">Birds</SelectItem>
                <SelectItem value="digital-pulse">Digital Pulse</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Gradual Volume */}
          <div className="flex items-center justify-between">
            <Label className="font-body text-sm">Gradual Volume</Label>
            <Switch
              checked={settings.IsGradualVolumeEnabled}
              onCheckedChange={(v) => updateSettings({ IsGradualVolumeEnabled: v })}
            />
          </div>

          {settings.IsGradualVolumeEnabled && (
            <div className="flex items-center justify-between pl-4">
              <Label className="font-body text-xs text-muted-foreground">Duration</Label>
              <Select
                value={String(settings.GradualVolumeDurationSec)}
                onValueChange={(v) => updateSettings({ GradualVolumeDurationSec: Number(v) })}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15s</SelectItem>
                  <SelectItem value="30">30s</SelectItem>
                  <SelectItem value="60">60s</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-heading">
            <Clock className="h-4 w-4" />
            Display
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <Label className="font-body text-sm">24-Hour Clock</Label>
            <Switch
              checked={settings.Is24Hour}
              onCheckedChange={(v) => updateSettings({ Is24Hour: v })}
            />
          </div>
        </CardContent>
      </Card>

      {/* System */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-heading">
            <Laptop className="h-4 w-4" />
            System
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <Label className="font-body text-sm">Auto-Launch on Startup</Label>
            <Switch
              checked={settings.AutoLaunch}
              onCheckedChange={(v) => updateSettings({ AutoLaunch: v })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label className="font-body text-sm">Minimize to Tray</Label>
            <Switch
              checked={settings.MinimizeToTray}
              onCheckedChange={(v) => updateSettings({ MinimizeToTray: v })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Language */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-heading">
            <Globe className="h-4 w-4" />
            Language
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={settings.Language}
            onValueChange={(v) => updateSettings({ Language: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="ms">Bahasa Melayu</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-heading">
            <Database className="h-4 w-4" />
            Data
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <Label className="font-body text-sm">Event Retention</Label>
            <Select
              value={String(settings.EventRetentionDays)}
              onValueChange={(v) => updateSettings({ EventRetentionDays: Number(v) })}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="60">60 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
                <SelectItem value="180">180 days</SelectItem>
                <SelectItem value="365">1 year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <Label className="font-body text-sm">Export Privacy Warning</Label>
            <Switch
              checked={settings.ExportWarningDismissed}
              onCheckedChange={(v) => updateSettings({ ExportWarningDismissed: v })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Info */}
      <Card>
        <CardContent className="flex flex-col gap-1 p-4 text-xs text-muted-foreground font-body">
          <div className="flex justify-between">
            <span>Timezone</span>
            <span>{settings.SystemTimezone}</span>
          </div>
          <Separator className="my-1" />
          <div className="flex justify-between">
            <span>Version</span>
            <span>1.0.0</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
