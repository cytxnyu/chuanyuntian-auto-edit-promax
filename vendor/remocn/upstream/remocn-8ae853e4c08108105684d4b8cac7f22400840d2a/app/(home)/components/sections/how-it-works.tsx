"use client";

import { ArrowRight } from "lucide-react";
import { useInView } from "motion/react";
import Link from "next/link";
import { useRef } from "react";
import { HOW_IT_WORKS_STEPS, type HowItWorksStep } from "@/config/landing";
import { useTrackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { SectionHeading } from "../section-heading";
import {
  AgentWindowViz,
  PlayerRevealViz,
  PromptTypingViz,
} from "./how-it-works-viz";

const EYEBROW = "How it works";
const TITLE = "Two things: an agent and an empty folder.";
const LEAD =
  "No editor to learn, no timeline to scrub. You describe, it builds, you watch it happen.";

const VIZ = [AgentWindowViz, PromptTypingViz, PlayerRevealViz];

function StepColumn({ step, index }: { step: HowItWorksStep; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const Viz = VIZ[index];

  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col gap-6 py-8 sm:gap-8 sm:py-10",
        index > 0 &&
          "border-t border-border/60 lg:border-t-0 lg:border-l lg:pl-8",
        index < HOW_IT_WORKS_STEPS.length - 1 && "lg:pr-8",
      )}
    >
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-border font-mono text-xs text-muted-foreground">
        {index + 1}
      </span>

      <div
        aria-hidden
        className="pointer-events-none aspect-[4/3] w-full select-none"
      >
        <Viz play={inView} />
      </div>

      <div className="mt-auto min-w-0">
        <h3 className="text-base font-semibold tracking-tight text-balance text-foreground sm:text-lg">
          {step.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-pretty text-muted-foreground sm:text-base">
          {step.detail}
        </p>
      </div>
    </div>
  );
}

export function HowItWorks({ className }: { className?: string }) {
  const trackEvent = useTrackEvent();

  return (
    <section
      id="how-it-works"
      className={cn("relative pt-6 pb-14 sm:pt-0 sm:pb-20", className)}
    >
      <div className="section">
        <SectionHeading
          eyebrow={EYEBROW}
          title={TITLE}
          lead={LEAD}
          animated={false}
        />

        <div className="mt-10 grid grid-cols-1 border-y border-border/60 sm:mt-10 lg:grid-cols-3">
          {HOW_IT_WORKS_STEPS.map((step, i) => (
            <StepColumn key={step.title} step={step} index={i} />
          ))}
        </div>

        <Link
          href="/docs/guides/setup"
          onClick={() =>
            trackEvent("cta_clicked", {
              cta: "how_it_works_setup",
              destination: "/docs/guides/setup",
            })
          }
          className="group relative mt-10 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors before:absolute before:inset-x-0 before:-inset-y-2 before:content-[''] hover:text-foreground sm:text-base"
        >
          First time? The setup guide takes ten minutes
          <ArrowRight
            aria-hidden
            className="size-4 transition-transform group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5"
          />
        </Link>
      </div>
    </section>
  );
}
