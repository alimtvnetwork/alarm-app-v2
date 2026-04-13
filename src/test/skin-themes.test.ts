/**
 * Skin theme tests — verifies settings persistence for skin changes.
 */

import { describe, expect, it, beforeEach } from "vitest";
import { useSettingsStore } from "@/stores/settings-store";

describe("Skin Theme Flow", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-skin");
  });

  it("updates ThemeSkin setting", async () => {
    await useSettingsStore.getState().updateSettings({ ThemeSkin: "midnight" });
    expect(useSettingsStore.getState().settings.ThemeSkin).toBe("midnight");
  });

  it("reverts to default skin", async () => {
    await useSettingsStore.getState().updateSettings({ ThemeSkin: "ocean" });
    await useSettingsStore.getState().updateSettings({ ThemeSkin: "default" });
    expect(useSettingsStore.getState().settings.ThemeSkin).toBe("default");
  });

  it("validates all known skin values", async () => {
    const skins = ["default", "midnight", "sunrise", "ocean", "forest"];
    for (const skin of skins) {
      await useSettingsStore.getState().updateSettings({ ThemeSkin: skin });
      expect(useSettingsStore.getState().settings.ThemeSkin).toBe(skin);
    }
  });
});
