/**
 * ScrollTimePicker — A custom drum-roll / scroll-wheel time picker.
 * Three columns: Hour (1-12), Minute (00-59), Period (AM/PM).
 */

import { useRef, useEffect, useCallback, useState } from "react";
import { cn } from "@/lib/utils";

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;
const CENTER_INDEX = Math.floor(VISIBLE_ITEMS / 2);

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);
const PERIODS = ["AM", "PM"] as const;

interface ScrollColumnProps {
  items: (string | number)[];
  selected: number;
  onChange: (index: number) => void;
  formatItem?: (item: string | number) => string;
  loop?: boolean;
}

const ScrollColumn = ({ items, selected, onChange, formatItem, loop = true }: ScrollColumnProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const getScrollTop = useCallback(
    (index: number) => index * ITEM_HEIGHT,
    []
  );

  // Scroll to selected on mount & when selected changes externally
  useEffect(() => {
    const el = containerRef.current;
    if (!el || isScrollingRef.current) return;
    el.scrollTop = getScrollTop(selected);
  }, [selected, getScrollTop]);

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    isScrollingRef.current = true;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      const index = Math.round(el.scrollTop / ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(items.length - 1, index));
      el.scrollTo({ top: getScrollTop(clamped), behavior: "smooth" });
      onChange(clamped);
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 100);
    }, 80);
  }, [items.length, onChange, getScrollTop]);

  const handleClick = useCallback(
    (index: number) => {
      const el = containerRef.current;
      if (!el) return;
      el.scrollTo({ top: getScrollTop(index), behavior: "smooth" });
      onChange(index);
    },
    [onChange, getScrollTop]
  );

  const fmt = formatItem ?? ((v) => String(v));

  // Padding so first/last items can reach center
  const padTop = CENTER_INDEX * ITEM_HEIGHT;
  const padBottom = CENTER_INDEX * ITEM_HEIGHT;

  return (
    <div className="relative h-[220px] w-20 overflow-hidden">
      {/* Highlight band */}
      <div
        className="pointer-events-none absolute left-1 right-1 z-10 rounded-xl bg-primary/15 border border-primary/20"
        style={{
          top: padTop,
          height: ITEM_HEIGHT,
        }}
      />
      {/* Fade edges */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-20 bg-gradient-to-b from-card to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-20 bg-gradient-to-t from-card to-transparent" />

      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full snap-y snap-mandatory overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none]"
        style={{ scrollSnapType: "y mandatory" }}
      >
        {/* Top padding */}
        <div style={{ height: padTop }} />
        {items.map((item, i) => {
          const isSelected = i === selected;
          return (
            <button
              key={i}
              type="button"
              onClick={() => handleClick(i)}
              className={cn(
                "flex w-full items-center justify-center font-heading transition-all duration-200 snap-center",
                isSelected
                  ? "text-2xl font-bold text-foreground scale-110"
                  : "text-lg font-medium text-muted-foreground/50 hover:text-muted-foreground/80"
              )}
              style={{ height: ITEM_HEIGHT, scrollSnapAlign: "center" }}
            >
              {fmt(item)}
            </button>
          );
        })}
        {/* Bottom padding */}
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
      onChange(`${String(newH24).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    },
    [isPM, m, onChange]
  );

  const handleMinuteChange = useCallback(
    (index: number) => {
      onChange(`${String(h24).padStart(2, "0")}:${String(index).padStart(2, "0")}`);
    },
    [h24, onChange]
  );

  const handlePeriodChange = useCallback(
    (index: number) => {
      const newIsPM = index === 1;
      if (newIsPM === isPM) return;
      const newH24 = isPM ? h24 - 12 : h24 + 12;
      onChange(`${String(newH24).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
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
      />
      <span className="text-2xl font-heading font-bold text-foreground/40 pb-0.5">:</span>
      <ScrollColumn
        items={MINUTES}
        selected={minuteIndex}
        onChange={handleMinuteChange}
        formatItem={(v) => String(v).padStart(2, "0")}
      />
      <ScrollColumn
        items={[...PERIODS]}
        selected={periodIndex}
        onChange={handlePeriodChange}
        loop={false}
      />
    </div>
  );
};

export default ScrollTimePicker;
