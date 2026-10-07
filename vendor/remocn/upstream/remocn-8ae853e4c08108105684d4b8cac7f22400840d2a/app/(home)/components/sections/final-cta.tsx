"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GITHUB_URL } from "@/config/site";
import { useTrackEvent } from "@/lib/analytics";

export function FinalCTA() {
  const trackEvent = useTrackEvent();

  return (
    <section className="relative py-14 sm:py-28">
      <div className="section">
        <div className="surface-card relative overflow-hidden rounded-3xl px-6 py-12 text-center sm:px-12 sm:py-20">
          <h2 className="mx-auto max-w-2xl text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Your product deserves better than a screen recording.
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            An agent, an empty folder, ten minutes. It’s open source, all the
            way down.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              className="h-11 gap-2 rounded-full px-6 text-sm"
              render={
                <Link
                  href="/docs/guides/setup"
                  onClick={() =>
                    trackEvent("cta_clicked", {
                      cta: "final_cta",
                      destination: "/docs/guides/setup",
                    })
                  }
                />
              }
            >
              Make your first video
              <ArrowRight
                data-icon="inline-end"
                className="size-4"
                aria-hidden="true"
              />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-11 rounded-full px-6 text-sm"
              render={
                <Link href={GITHUB_URL} target="_blank" rel="noreferrer" />
              }
            >
              Star on GitHub
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
