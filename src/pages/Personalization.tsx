/**
 * Personalization Page — Theme switcher, accent color picker, streak calendar, clock format.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ThemeMode } from "@/types/alarm";
import { useSettingsStore } from "@/stores/settings-store";
import { Sun, Moon, Monitor, Palette, Check } from "lucide-react";
import StreakCalendar from "@/components/personalization/StreakCalendar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const ACCENT_COLORS = [
  { value: "#8b7355", label: "Warm Brown" },
  { value: "#6366F1", label: "Indigo" },
  { value: "#10B981", label: "Emerald" },
  { value: "#F59E0B", label: "Amber" },
  { value: "#EF4444", label: "Red" },
  { value: "#8B5CF6", label: "Violet" },
];

const THEME_OPTIONS = [
  { value: ThemeMode.Light, label: "Light", icon: Sun, tip: "Warm cream palette" },
  { value: ThemeMode.Dark, label: "Dark", icon: Moon, tip: "Warm charcoal palette" },
  { value: ThemeMode.System, label: "System", icon: Monitor, tip: "Follow your OS setting" },
];

const Personalization = () => {
  const settings = useSettingsStore((s) => s.settings);
  const updateSettings = useSettingsStore((s) => s.updateSettings);

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-col gap-4">
        <h1 className="text-xl font-heading font-bold">Personalization</h1>

        {/* Streak Calendar */}
        <StreakCalendar />

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
              {THEME_OPTIONS.map(({ value, label, icon: Icon, tip }) => (
                <Tooltip key={value}>
                  <TooltipTrigger asChild>
                    <button
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
                  </TooltipTrigger>
                  <TooltipContent>{tip}</TooltipContent>
                </Tooltip>
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
            <p className="text-xs text-muted-foreground font-body">
              Changes buttons, highlights, and active indicators across the app.
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {ACCENT_COLORS.map(({ value, label }) => {
                const isActive = settings.AccentColor === value;
                return (
                  <Tooltip key={value}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => updateSettings({ AccentColor: value })}
                        className="flex flex-col items-center gap-1"
                        aria-label={label}
                      >
                        <div
                          className={`relative h-10 w-10 rounded-full transition-transform ${
                            isActive ? "scale-110 ring-2 ring-foreground ring-offset-2 ring-offset-background" : "hover:scale-105"
                          }`}
                          style={{ backgroundColor: value }}
                        >
                          {isActive && (
                            <Check className="absolute inset-0 m-auto h-5 w-5 text-white drop-shadow" />
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground font-body">{label}</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>{label}</TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Clock format */}
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <Label className="font-body text-sm">24-Hour Clock</Label>
              <p className="text-xs text-muted-foreground font-body">
                Switch between 12h (AM/PM) and 24h format.
              </p>
            </div>
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
    </TooltipProvider>
  );
};

export default Personalization;
