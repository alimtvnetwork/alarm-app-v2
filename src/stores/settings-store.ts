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

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: { ...DEFAULT_SETTINGS },

  loadSettings: () => {
    const settings = ipc.getSettings();
    set({ settings });
    applyThemeClass(settings.Theme);
  },

  updateSettings: (partial) => {
    const updated = ipc.updateSettings(partial);
    set({ settings: updated });
    if (partial.Theme !== undefined) {
      applyThemeClass(partial.Theme);
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
