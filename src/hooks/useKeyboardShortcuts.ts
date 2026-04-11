/**
 * useKeyboardShortcuts — Global keyboard shortcuts for the alarm app.
 * N = new alarm, Space = snooze overlay, Escape = dismiss overlay, ? = toggle help
 */

import { useEffect, useCallback } from "react";
import { useOverlayStore } from "@/stores/overlay-store";

export function useKeyboardShortcuts() {
  const isOverlayVisible = useOverlayStore((s) => s.isVisible);
  const snooze = useOverlayStore((s) => s.snooze);
  const dismiss = useOverlayStore((s) => s.dismiss);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Skip if user is typing in an input
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      if (isOverlayVisible) {
        if (e.code === "Space") {
          e.preventDefault();
          snooze();
        } else if (e.code === "Escape") {
          e.preventDefault();
          dismiss();
        }
        return;
      }

      if (e.key === "n" || e.key === "N") {
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        e.preventDefault();
        window.dispatchEvent(new Event("alarm:new"));
      }
    },
    [isOverlayVisible, snooze, dismiss]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
