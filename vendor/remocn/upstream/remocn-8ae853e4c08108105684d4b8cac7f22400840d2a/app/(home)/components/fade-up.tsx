"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { SPRING_BOUNCE } from "@/config/site";

const HIDDEN = { opacity: 0, y: 24, filter: "blur(8px)" };
const VISIBLE = { opacity: 1, y: 0, filter: "blur(0px)" };

export function FadeUp({
  children,
  delay = 0,
  className = "",
  gate,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  gate?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const reduced = useReducedMotion();
  const [seen] = useState(
    () =>
      gate !== undefined &&
      typeof window !== "undefined" &&
      sessionStorage.getItem(gate) !== null,
  );
  useEffect(() => {
    if (gate !== undefined) sessionStorage.setItem(gate, "1");
  }, [gate]);
  const instant = Boolean(reduced) || seen;
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={HIDDEN}
      animate={instant || inView ? VISIBLE : HIDDEN}
      transition={instant ? { duration: 0 } : { ...SPRING_BOUNCE, delay }}
    >
      {children}
    </motion.div>
  );
}
