import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "page-shell relative flex min-h-screen flex-col font-sans text-foreground antialiased",
        className,
      )}
    >
      {children}
    </div>
  );
}
