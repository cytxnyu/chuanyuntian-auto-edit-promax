"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useTrackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

type CopyState = "idle" | "loading" | "copied";

export function CopyMarkdownButton({
  url,
  className,
}: {
  url: string;
  className?: string;
}) {
  const [state, setState] = useState<CopyState>("idle");
  const trackEvent = useTrackEvent();

  const handleCopy = async () => {
    if (state !== "idle") return;
    setState("loading");
    const text = await fetch(url)
      .then((res) => (res.ok ? res.text() : null))
      .catch(() => null);
    if (text === null) {
      setState("idle");
      return;
    }
    await navigator.clipboard.writeText(text).catch(() => undefined);
    setState("copied");
    trackEvent("docs_markdown_copied", { page: url });
    setTimeout(() => setState("idle"), 1500);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCopy}
      disabled={state === "loading"}
      className={cn(
        "w-fit gap-1.5 rounded-full text-xs text-muted-foreground hover:text-foreground",
        className,
      )}
    >
      {state === "copied" ? (
        <Check className="size-3.5" />
      ) : (
        <Copy className="size-3.5" />
      )}
      Copy as Markdown
    </Button>
  );
}
