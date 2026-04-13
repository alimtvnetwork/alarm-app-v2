/**
 * AlarmFeatureList — Left-panel documentation of alarm features
 * with icon, title, and description for each capability.
 */

import { Plus, Copy, Trash2, ToggleRight, GripVertical, Undo2 } from "lucide-react";

interface Feature {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    icon: <Plus className="h-4 w-4" />,
    iconBg: "bg-muted text-muted-foreground",
    title: "Create",
    description:
      "Time, label, date, repeat, sound, snooze duration, group assignment. Rust computes nextFireTime on save.",
  },
  {
    icon: <Copy className="h-4 w-4" />,
    iconBg: "bg-muted text-muted-foreground",
    title: "Duplicate",
    description:
      "One-click clone — copies all fields, new UUID, appends '(Copy)' to label.",
  },
  {
    icon: <Trash2 className="h-4 w-4" />,
    iconBg: "bg-destructive/10 text-destructive",
    title: "Soft-Delete + Undo",
    description:
      "Sets deletedAt timestamp. 5-second undo toast. After timeout: permanent removal.",
  },
  {
    icon: <ToggleRight className="h-4 w-4" />,
    iconBg: "bg-primary/10 text-primary",
    title: "Toggle",
    description:
      "Quick enable/disable without opening edit. Recomputes nextFireTime when enabling.",
  },
  {
    icon: <GripVertical className="h-4 w-4" />,
    iconBg: "bg-muted text-muted-foreground",
    title: "Drag & Drop",
    description:
      "@dnd-kit/core — drag alarms between groups. Keyboard: Ctrl+Shift+↑/↓ (WCAG 2.1 AA).",
  },
  {
    icon: <Undo2 className="h-4 w-4" />,
    iconBg: "bg-muted text-muted-foreground",
    title: "Undo System",
    description:
      "invoke('delete_alarm') → returns undoToken. invoke('undo_delete_alarm') restores fully.",
  },
];

const AlarmFeatureList = () => {
  return (
    <div className="flex flex-col gap-5">
      {FEATURES.map((feature) => (
        <div key={feature.title} className="flex items-start gap-3">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${feature.iconBg}`}
          >
            {feature.icon}
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-heading font-semibold text-foreground">
              {feature.title}
            </span>
            <span className="text-xs font-body text-muted-foreground leading-relaxed">
              {feature.description}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AlarmFeatureList;
