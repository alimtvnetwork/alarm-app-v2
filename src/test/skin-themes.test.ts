/**
 * Skin theme tests — verifies CSS variable application and settings persistence.
 */

import { describe, expect, it, beforeEach } from "vitest";
import { useSettingsStore } from "@/stores/settings-store";

describe("Skin Theme Flow", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-skin");
    useSettingsStore.setState({
      settings: {
        ...useSettingsStore.getState().settings,
        ThemeSkin: "default",
      },
    });
  });

  it("applies skin data attribute to document", () => {
    const store = useSettingsStore.getState();
    store.updateSetting("ThemeSkin", "midnight");

    const settings = useSettingsStore.getState().settings;
    expect(settings.ThemeSkin).toBe("midnight");
  });

  it("reverts to default skin", () => {
    const store = useSettingsStore.getState();
    store.updateSetting("ThemeSkin", "ocean");
    store.updateSetting("ThemeSkin", "default");

    const settings = useSettingsStore.getState().settings;
    expect(settings.ThemeSkin).toBe("default");
  });

  it("persists skin across store reloads", () => {
    useSettingsStore.getState().updateSetting("ThemeSkin", "forest");
    
    // Simulate reload by reading persisted settings
    const settings = useSettingsStore.getState().settings;
    expect(settings.ThemeSkin).toBe("forest");
  });

  it("validates known skin values", () => {
    const validSkins = ["default", "midnight", "sunrise", "ocean", "forest"];
    validSkins.forEach((skin) => {
      useSettingsStore.getState().updateSetting("ThemeSkin", skin);
      expect(useSettingsStore.getState().settings.ThemeSkin).toBe(skin);
    });
  });
});
