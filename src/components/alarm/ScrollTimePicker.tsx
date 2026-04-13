/**
 * ScrollTimePicker — A custom drum-roll / scroll-wheel time picker.
 * Three columns: Hour (1-12), Minute (00-59), Period (AM/PM).
 * Hour and Minute columns loop infinitely for a seamless circular feel.
 */

import { useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;
const CENTER_INDEX = Math.floor(VISIBLE_ITEMS / 2);

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);
const PERIODS = ["AM", "PM"] as const;

/**
 * For circular scrolling we repeat the items N times so there's always
 * content above and below. We pick a large-enough repeat count and
 * start the scroll in the middle set so the user can scroll up or down freely.
 */
const REPEAT_COUNT = 50;

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
  const isScrollingRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const didMountRef = useRef(false);
  const len = items.length;

  const totalItems = circular ? len * REPEAT_COUNT : len;
  // The "home" position: middle repeat set, at the selected index
  const middleSetStart = circular ? Math.floor(REPEAT_COUNT / 2) * len : 0;

  const getScrollTop = useCallback(
    (absoluteIndex: number) => absoluteIndex * ITEM_HEIGHT,
    []
  );

  // On mount & when selected changes externally, jump to the middle set
  useEffect(() => {
    const el = containerRef.current;
    if (!el || isScrollingRef.current) return;
    const target = middleSetStart + selected;
    if (!didMountRef.current) {
      // Instant jump on first mount
      el.scrollTop = getScrollTop(target);
      didMountRef.current = true;
    } else {
      el.scrollTo({ top: getScrollTop(target), behavior: "smooth" });
    }
  }, [selected, middleSetStart, getScrollTop]);

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    isScrollingRef.current = true;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      const rawIndex = Math.round(el.scrollTop / ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(totalItems - 1, rawIndex));
      const realIndex = circular ? ((clamped % len) + len) % len : clamped;

      // Snap to position
      el.scrollTo({ top: getScrollTop(clamped), behavior: "smooth" });
      onChange(realIndex);

      // If we're getting far from the middle, silently re-center
      if (circular) {
        const distFromMiddle = Math.abs(clamped - (middleSetStart + realIndex));
        if (distFromMiddle > len * 10) {
          setTimeout(() => {
            const recentered = middleSetStart + realIndex;
            el.scrollTop = getScrollTop(recentered);
          }, 200);
        }
      }

      setTimeout(() => {
        isScrollingRef.current = false;
      }, 100);
    }, 80);
  }, [totalItems, len, circular, middleSetStart, onChange, getScrollTop]);

  const handleClick = useCallback(
    (absoluteIndex: number) => {
      const el = containerRef.current;
      if (!el) return;
      el.scrollTo({ top: getScrollTop(absoluteIndex), behavior: "smooth" });
      const realIndex = circular
        ? ((absoluteIndex % len) + len) % len
        : absoluteIndex;
      onChange(realIndex);
    },
    [onChange, getScrollTop, circular, len]
  );

  const fmt = formatItem ?? ((v) => String(v));
  const padTop = CENTER_INDEX * ITEM_HEIGHT;
  const padBottom = CENTER_INDEX * ITEM_HEIGHT;

  // Build the repeated item list
  const allItems: { value: string | number; absoluteIndex: number }[] = [];
  for (let i = 0; i < totalItems; i++) {
    const realIdx = circular ? i % len : i;
    allItems.push({ value: items[realIdx], absoluteIndex: i });
  }

  // Determine which absolute index is currently centered
  const currentAbsolute = useRef(middleSetStart + selected);
  useEffect(() => {
    currentAbsolute.current = middleSetStart + selected;
  }, [middleSetStart, selected]);

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
        className="h-full snap-y snap-mandatory overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none]"
        style={{ scrollSnapType: "y mandatory" }}
      >
        <div style={{ height: padTop }} />
        {allItems.map(({ value, absoluteIndex }) => {
          const realIdx = circular
            ? ((absoluteIndex % len) + len) % len
            : absoluteIndex;
          const isSelected = realIdx === selected;
          return (
            <button
              key={absoluteIndex}
              type="button"
              onClick={() => handleClick(absoluteIndex)}
              className={cn(
                "flex w-full items-center justify-center font-heading transition-all duration-200 snap-center",
                isSelected
                  ? "text-2xl font-bold text-foreground scale-110"
                  : "text-lg font-medium text-muted-foreground/50 hover:text-muted-foreground/80"
              )}
              style={{ height: ITEM_HEIGHT, scrollSnapAlign: "center" }}
            >
              {fmt(value)}
            </button>
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
