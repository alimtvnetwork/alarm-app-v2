/**
 * Settings Store — Zustand store for app settings.
 * Uses mock IPC layer (swap for real Tauri invoke in production).
 */

import { create } from "zustand";
import type { Settings } from "@/types/alarm";
import { ThemeMode, DEFAULT_SETTINGS } from "@/types/alarm";
import * as ipc from "@/lib/mock-ipc";

interface SettingsStore {
  settings: Settings;
  loadSettings: () => void;
  updateSettings: (partial: Partial<Settings>) => void;
  setTheme: (theme: ThemeMode) => void;
  toggleIs24Hour: () => void;
}

function hexToHSL(hex: string): string | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;
  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function applyThemeClass(theme: ThemeMode): void {
  const root = document.documentElement;
  root.classList.remove("dark");

  if (theme === ThemeMode.Dark) {
    root.classList.add("dark");
  } else if (theme === ThemeMode.System) {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (prefersDark) {
      root.classList.add("dark");
    }
  }
}

function applyAccentColor(hex: string): void {
  const hsl = hexToHSL(hex);
  if (!hsl) return;
  const root = document.documentElement;
  root.style.setProperty("--primary", hsl);
  root.style.setProperty("--ring", hsl);
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: { ...DEFAULT_SETTINGS },

  loadSettings: () => {
    const settings = ipc.getSettings();
    set({ settings });
    applyThemeClass(settings.Theme);
    applyAccentColor(settings.AccentColor);
  },

  updateSettings: (partial) => {
    const updated = ipc.updateSettings(partial);
    set({ settings: updated });
    if (partial.Theme !== undefined) {
      applyThemeClass(partial.Theme);
    }
    if (partial.AccentColor !== undefined) {
      applyAccentColor(partial.AccentColor);
    }
  },

  setTheme: (theme) => {
    get().updateSettings({ Theme: theme });
  },

  toggleIs24Hour: () => {
    const current = get().settings.Is24Hour;
    get().updateSettings({ Is24Hour: !current });
  },
}));
