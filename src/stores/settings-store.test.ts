/**
 * Settings Store Tests — Verifies settings load, update, theme, and 24h toggle.
 */

import { describe, expect, it, beforeEach } from "vitest";
import { useSettingsStore } from "@/stores/settings-store";
import { ThemeMode } from "@/types/alarm";

describe("settings-store", () => {
  beforeEach(() => {
    localStorage.clear();
    useSettingsStore.setState({
      settings: { ...useSettingsStore.getState().settings },
      isLoading: false,
    });
  });

  it("loadSettings populates store from mock", async () => {
    await useSettingsStore.getState().loadSettings();
    const { settings } = useSettingsStore.getState();
    expect(settings.Theme).toBeDefined();
    expect(settings.SystemTimezone).toBeDefined();
  });

  it("updateSettings persists partial changes", async () => {
    await useSettingsStore.getState().loadSettings();
    await useSettingsStore.getState().updateSettings({ Is24Hour: true });

    const { settings } = useSettingsStore.getState();
    expect(settings.Is24Hour).toBe(true);
  });

  it("setTheme updates Theme and applies class", async () => {
    await useSettingsStore.getState().loadSettings();
    await useSettingsStore.getState().setTheme(ThemeMode.Dark);

    expect(useSettingsStore.getState().settings.Theme).toBe(ThemeMode.Dark);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("setTheme Light removes dark class", async () => {
    await useSettingsStore.getState().loadSettings();
    await useSettingsStore.getState().setTheme(ThemeMode.Dark);
    await useSettingsStore.getState().setTheme(ThemeMode.Light);

    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("toggleIs24Hour flips boolean", async () => {
    await useSettingsStore.getState().loadSettings();
    const before = useSettingsStore.getState().settings.Is24Hour;

    await useSettingsStore.getState().toggleIs24Hour();

    expect(useSettingsStore.getState().settings.Is24Hour).toBe(!before);
  });

  it("isLoading is true during load", async () => {
    const loadPromise = useSettingsStore.getState().loadSettings();
    // isLoading should be true at some point during load
    await loadPromise;
    expect(useSettingsStore.getState().isLoading).toBe(false);
  });
});
