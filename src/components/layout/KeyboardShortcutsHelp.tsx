/**
 * KeyboardShortcutsHelp — Small floating tooltip showing available shortcuts.
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const SHORTCUTS = [
  { key: "N", action: "shortcut.newAlarm" },
  { key: "Space", action: "shortcut.snooze" },
  { key: "Esc", action: "shortcut.dismiss" },
];

const KeyboardShortcutsHelp = () => {
  const { t } = useTranslation();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="fixed bottom-20 right-4 z-30 h-8 w-8 rounded-full bg-card shadow-md opacity-60 hover:opacity-100"
          aria-label="Keyboard shortcuts"
        >
          <Keyboard className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent side="top" align="end" className="w-52 p-3">
        <p className="text-xs font-heading font-semibold mb-2">
          {t("shortcut.title")}
        </p>
        <div className="flex flex-col gap-1.5">
          {SHORTCUTS.map(({ key, action }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-xs font-body text-muted-foreground">
                {t(action)}
              </span>
              <kbd className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono font-medium text-muted-foreground">
                {key}
              </kbd>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default KeyboardShortcutsHelp;
