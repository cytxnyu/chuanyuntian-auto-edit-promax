import type { Metadata } from "next";
import Link from "next/link";
import { FadeUp } from "@/app/(home)/components/fade-up";
import { PageShell } from "@/app/(home)/components/page-shell";
import { SiteFooter } from "@/app/(home)/components/site-footer";
import { SiteHeader } from "@/app/(home)/components/site-header";
import { Button } from "@/components/ui/button";
import { NotFoundVideo } from "./not-found-video";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <PageShell className="h-dvh min-h-0 overflow-hidden">
      <div className="shrink-0">
        <SiteHeader />
      </div>

      <main className="relative isolate flex min-h-0 flex-1 flex-col">
        <div aria-hidden className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-grid-fade" />
        </div>

        <div className="min-h-0 flex-1">
          <NotFoundVideo />
        </div>

        <div className="section shrink-0 pt-4 pb-6 sm:pt-6 sm:pb-8">
          <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
            <FadeUp delay={0.08}>
              <h1 className="text-balance text-3xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-4xl">
                This page doesn't exist
              </h1>
            </FadeUp>

            <FadeUp delay={0.14}>
              <p className="mt-3 text-balance text-base leading-relaxed text-muted-foreground sm:text-lg">
                The link is broken, or the page moved. The components, docs and
                showcases are all still where you left them.
              </p>
            </FadeUp>

            <FadeUp delay={0.2}>
              <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row">
                <Button
                  size="lg"
                  className="rounded-full"
                  render={<Link href="/" />}
                >
                  Back home
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  className="rounded-full font-medium"
                  render={<Link href="/docs/typography" />}
                >
                  Browse components
                </Button>
              </div>
            </FadeUp>
          </div>
        </div>
      </main>

      <div className="shrink-0">
        <SiteFooter />
      </div>
    </PageShell>
  );
}
