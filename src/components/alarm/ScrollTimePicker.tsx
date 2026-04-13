/**
 * ScrollTimePicker — A custom drum-roll / scroll-wheel time picker.
 * Three columns: Hour (1-12), Minute (00-59), Period (AM/PM).
 * Uses a smaller repeat count and CSS-based snapping for smooth performance.
 */

import { useRef, useEffect, useCallback, useState } from "react";
import { cn } from "@/lib/utils";

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;
const CENTER_INDEX = Math.floor(VISIBLE_ITEMS / 2);

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);
const PERIODS = ["AM", "PM"] as const;

/** Fewer repeats = fewer DOM nodes = smoother scrolling */
const REPEAT_COUNT = 6;

interface ScrollColumnProps {
  items: (string | number)[];
  selected: number;
  onChange: (index: number) => void;
  formatItem?: (item: string | number) => string;
  circular?: boolean;
}

const ScrollColumn = ({
  items,
  selected,
  onChange,
  formatItem,
  circular = true,
}: ScrollColumnProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isUserScrolling = useRef(false);
  const rafRef = useRef<number>(0);
  const settleTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const suppressScrollRef = useRef(false);
  const len = items.length;

  const totalItems = circular ? len * REPEAT_COUNT : len;
  const middleSetStart = circular ? Math.floor(REPEAT_COUNT / 2) * len : 0;

  const scrollTo = useCallback(
    (absoluteIndex: number, smooth = false) => {
      const el = containerRef.current;
      if (!el) return;
      const top = absoluteIndex * ITEM_HEIGHT;
      if (smooth) {
        el.scrollTo({ top, behavior: "smooth" });
      } else {
        el.scrollTop = top;
      }
    },
    []
  );

  // Jump to selected on mount; smooth-scroll on prop changes
  useEffect(() => {
    if (isUserScrolling.current) return;
    const target = middleSetStart + selected;
    suppressScrollRef.current = true;
    scrollTo(target, false);
    // Release suppression after a tick
    requestAnimationFrame(() => {
      suppressScrollRef.current = false;
    });
  }, [selected, middleSetStart, scrollTo]);

  const settle = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const rawIndex = Math.round(el.scrollTop / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(totalItems - 1, rawIndex));
    const realIndex = circular ? ((clamped % len) + len) % len : clamped;

    // Snap
    scrollTo(clamped, true);
    onChange(realIndex);

    // Re-center if drifted far from middle
    if (circular) {
      const idealMiddle = middleSetStart + realIndex;
      const drift = Math.abs(clamped - idealMiddle);
      if (drift > len * 2) {
        setTimeout(() => {
          suppressScrollRef.current = true;
          scrollTo(idealMiddle, false);
          requestAnimationFrame(() => {
            suppressScrollRef.current = false;
          });
        }, 300);
      }
    }

    isUserScrolling.current = false;
  }, [totalItems, len, circular, middleSetStart, onChange, scrollTo]);

  const handleScroll = useCallback(() => {
    if (suppressScrollRef.current) return;
    isUserScrolling.current = true;
    if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    settleTimerRef.current = setTimeout(settle, 100);
  }, [settle]);

  const handleClick = useCallback(
    (absoluteIndex: number) => {
      const el = containerRef.current;
      if (!el) return;
      suppressScrollRef.current = true;
      scrollTo(absoluteIndex, true);
      const realIndex = circular
        ? ((absoluteIndex % len) + len) % len
        : absoluteIndex;
      onChange(realIndex);
      setTimeout(() => {
        suppressScrollRef.current = false;
      }, 400);
    },
    [onChange, scrollTo, circular, len]
  );

  const fmt = formatItem ?? ((v) => String(v));
  const padTop = CENTER_INDEX * ITEM_HEIGHT;
  const padBottom = CENTER_INDEX * ITEM_HEIGHT;

  // Build item list — with fewer repeats this is lightweight
  const allItems: { value: string | number; absoluteIndex: number }[] = [];
  for (let i = 0; i < totalItems; i++) {
    const realIdx = circular ? i % len : i;
    allItems.push({ value: items[realIdx], absoluteIndex: i });
  }

  return (
    <div className="relative h-[220px] w-20 overflow-hidden">
      {/* Highlight band */}
      <div
        className="pointer-events-none absolute left-1 right-1 z-10 rounded-xl bg-primary/15 border border-primary/20"
        style={{ top: padTop, height: ITEM_HEIGHT }}
      />
      {/* Fade edges */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-20 bg-gradient-to-b from-card to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-20 bg-gradient-to-t from-card to-transparent" />

      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none]"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div style={{ height: padTop }} />
        {allItems.map(({ value, absoluteIndex }) => {
          const realIdx = circular
            ? ((absoluteIndex % len) + len) % len
            : absoluteIndex;
          const isSelected = realIdx === selected;
          return (
            <div
              key={absoluteIndex}
              onClick={() => handleClick(absoluteIndex)}
              className={cn(
                "flex w-full items-center justify-center font-heading transition-colors duration-150 cursor-pointer select-none",
                isSelected
                  ? "text-2xl font-bold text-foreground"
                  : "text-lg font-medium text-muted-foreground/50 hover:text-muted-foreground/80"
              )}
              style={{ height: ITEM_HEIGHT }}
            >
              {fmt(value)}
            </div>
          );
        })}
        <div style={{ height: padBottom }} />
      </div>
    </div>
  );
};

interface ScrollTimePickerProps {
  /** 24h format "HH:MM" */
  value: string;
  onChange: (time24: string) => void;
}

const ScrollTimePicker = ({ value, onChange }: ScrollTimePickerProps) => {
  const [h24, m] = value.split(":").map(Number);
  const isPM = h24 >= 12;
  const h12 = h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24;

  const hourIndex = HOURS.indexOf(h12);
  const minuteIndex = m;
  const periodIndex = isPM ? 1 : 0;

  const handleHourChange = useCallback(
    (index: number) => {
      const newH12 = HOURS[index];
      let newH24: number;
      if (isPM) {
        newH24 = newH12 === 12 ? 12 : newH12 + 12;
      } else {
        newH24 = newH12 === 12 ? 0 : newH12;
      }
      onChange(
        `${String(newH24).padStart(2, "0")}:${String(m).padStart(2, "0")}`
      );
    },
    [isPM, m, onChange]
  );

  const handleMinuteChange = useCallback(
    (index: number) => {
      onChange(
        `${String(h24).padStart(2, "0")}:${String(index).padStart(2, "0")}`
      );
    },
    [h24, onChange]
  );

  const handlePeriodChange = useCallback(
    (index: number) => {
      const newIsPM = index === 1;
      if (newIsPM === isPM) return;
      const newH24 = isPM ? h24 - 12 : h24 + 12;
      onChange(
        `${String(newH24).padStart(2, "0")}:${String(m).padStart(2, "0")}`
      );
    },
    [h24, m, isPM, onChange]
  );

  return (
    <div className="flex items-center justify-center gap-1 rounded-2xl bg-card border border-border p-3">
      <ScrollColumn
        items={HOURS}
        selected={hourIndex}
        onChange={handleHourChange}
        formatItem={(v) => String(v).padStart(2, "0")}
        circular
      />
      <span className="text-2xl font-heading font-bold text-foreground/40 pb-0.5">
        :
      </span>
      <ScrollColumn
        items={MINUTES}
        selected={minuteIndex}
        onChange={handleMinuteChange}
        formatItem={(v) => String(v).padStart(2, "0")}
        circular
      />
      <ScrollColumn
        items={[...PERIODS]}
        selected={periodIndex}
        onChange={handlePeriodChange}
        circular={false}
      />
    </div>
  );
};

export default ScrollTimePicker;
