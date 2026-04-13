/**
 * useLanguageSync — Syncs i18n language with settings store.
 * When settings change the Language key, this updates react-i18next.
 * When running in Tauri, also listens for timezone-changed events.
 */

import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSettingsStore } from "@/stores/settings-store";

export function useLanguageSync(): void {
  const { i18n } = useTranslation();
  const language = useSettingsStore((s) => s.settings.Language);

  useEffect(() => {
    if (language && i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [language, i18n]);
}
