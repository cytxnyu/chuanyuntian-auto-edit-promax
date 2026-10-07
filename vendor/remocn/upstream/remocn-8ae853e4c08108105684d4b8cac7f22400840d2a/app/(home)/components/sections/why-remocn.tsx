"use client";

import {
  Bot,
  Clapperboard,
  FileCode2,
  MonitorPlay,
  Wallet,
  Zap,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
  type Transition,
  useReducedMotion,
} from "motion/react";
import { type ComponentType, type PointerEvent, useRef, useState } from "react";
import { REASONS } from "@/config/landing";
import { cn } from "@/lib/utils";
import { SectionHeading } from "../section-heading";

const EYEBROW = "Why remocn";
const TITLE = "Every other way costs you something";
const LEAD =
  "A designer’s invoice, a weekend in After Effects, or a screen recording you’re not proud of. remocn hands the animation to your agent already built.";

const ICONS: ComponentType<{ className?: string }>[] = [
  Wallet,
  Clapperboard,
  Bot,
  MonitorPlay,
  FileCode2,
  Zap,
];

const HIGHLIGHT_INSET = 16;

const MOVE: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 34,
  mass: 0.6,
};
const FADE: Transition = { duration: 0.15, ease: [0.32, 0.72, 0, 1] };
const EXIT: Transition = { duration: 0.12, ease: [0.32, 0.72, 0, 1] };

type HighlightRect = { x: number; y: number; width: number; height: number };

export function WhyRemocn({ className }: { className?: string }) {
  const gridRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(false);
  const [rect, setRect] = useState<HighlightRect | null>(null);
  const [enterId, setEnterId] = useState(0);
  const reduceMotion = useReducedMotion();

  const handleEnter = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    const grid = gridRef.current;
    if (!grid) return;

    const item = event.currentTarget.getBoundingClientRect();
    const bounds = grid.getBoundingClientRect();

    if (!activeRef.current) {
      activeRef.current = true;
      setEnterId((id) => id + 1);
    }

    setRect({
      x: item.left - bounds.left - HIGHLIGHT_INSET,
      y: item.top - bounds.top - HIGHLIGHT_INSET,
      width: item.width + HIGHLIGHT_INSET * 2,
      height: item.height + HIGHLIGHT_INSET * 2,
    });
  };

  const handleLeave = () => {
    activeRef.current = false;
    setRect(null);
  };

  return (
    <section
      id="why-remocn"
      className={cn("relative py-14 sm:py-20", className)}
    >
      <div className="section">
        <SectionHeading
          eyebrow={EYEBROW}
          title={TITLE}
          lead={LEAD}
          animated={false}
        />

        <div
          ref={gridRef}
          onPointerLeave={handleLeave}
          className="relative isolate mt-12 grid grid-cols-1 gap-x-8 gap-y-10 sm:mt-16 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-12"
        >
          <AnimatePresence>
            {rect && (
              <motion.span
                key={enterId}
                aria-hidden
                className="pointer-events-none absolute top-0 left-0 -z-10 rounded-xl bg-muted"
                initial={{ ...rect, opacity: 0, scale: 0.96 }}
                animate={{ ...rect, opacity: 1, scale: 1 }}
                exit={{
                  opacity: 0,
                  scale: 0.96,
                  transition: reduceMotion ? { duration: 0 } : EXIT,
                }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { default: MOVE, opacity: FADE, scale: FADE }
                }
              />
            )}
          </AnimatePresence>

          {REASONS.map((reason, i) => {
            const Icon = ICONS[i];
            return (
              <div
                key={reason.title}
                onPointerEnter={handleEnter}
                className="min-w-0"
              >
                <div className="flex items-center gap-2">
                  <Icon
                    aria-hidden
                    className="size-4 shrink-0 text-muted-foreground"
                  />
                  <h3 className="text-base font-medium text-foreground">
                    {reason.title}
                  </h3>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-pretty text-muted-foreground sm:text-base">
                  {reason.detail}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
