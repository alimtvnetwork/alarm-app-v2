/**
 * Personalization Page — Theme switcher, accent color picker, skin selector.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ThemeMode } from "@/types/alarm";
import { useSettingsStore } from "@/stores/settings-store";
import { Sun, Moon, Monitor, Palette } from "lucide-react";

const ACCENT_COLORS = [
  { value: "#8b7355", label: "Warm Brown" },
  { value: "#6366F1", label: "Indigo" },
  { value: "#10B981", label: "Emerald" },
  { value: "#F59E0B", label: "Amber" },
  { value: "#EF4444", label: "Red" },
  { value: "#8B5CF6", label: "Violet" },
];

const THEME_OPTIONS = [
  { value: ThemeMode.Light, label: "Light", icon: Sun },
  { value: ThemeMode.Dark, label: "Dark", icon: Moon },
  { value: ThemeMode.System, label: "System", icon: Monitor },
];

const Personalization = () => {
  const settings = useSettingsStore((s) => s.settings);
  const updateSettings = useSettingsStore((s) => s.updateSettings);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-heading font-bold">Personalization</h1>

      {/* Theme */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-heading">
            <Sun className="h-4 w-4" />
            Theme
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => updateSettings({ Theme: value })}
                className={`flex flex-1 flex-col items-center gap-1.5 rounded-lg p-3 transition-colors ${
                  settings.Theme === value
                    ? "bg-primary/15 ring-1 ring-primary"
                    : "bg-secondary hover:bg-secondary/80"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-body">{label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Accent Color */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-heading">
            <Palette className="h-4 w-4" />
            Accent Color
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {ACCENT_COLORS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => updateSettings({ AccentColor: value })}
                className={`flex flex-col items-center gap-1 ${
                  settings.AccentColor === value ? "scale-110" : ""
                }`}
                aria-label={label}
              >
                <div
                  className={`h-10 w-10 rounded-full transition-transform ${
                    settings.AccentColor === value
                      ? "ring-2 ring-foreground ring-offset-2 ring-offset-background"
                      : ""
                  }`}
                  style={{ backgroundColor: value }}
                />
                <span className="text-[10px] text-muted-foreground font-body">{label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Skin */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-heading">Skin</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={settings.ThemeSkin}
            onValueChange={(v) => updateSettings({ ThemeSkin: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="midnight">Midnight</SelectItem>
              <SelectItem value="ocean">Ocean</SelectItem>
              <SelectItem value="forest">Forest</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Clock format */}
      <Card>
        <CardContent className="flex items-center justify-between p-4">
          <Label className="font-body text-sm">24-Hour Clock</Label>
          <button
            onClick={() => updateSettings({ Is24Hour: !settings.Is24Hour })}
            className={`rounded-lg px-3 py-1.5 text-sm font-body transition-colors ${
              settings.Is24Hour
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground"
            }`}
          >
            {settings.Is24Hour ? "24h" : "12h"}
          </button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Personalization;
