import { lazy, Suspense, type ReactNode } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";

const EngagementEffects = lazy(() =>
  import("@/components/engagement-effects").then((m) => ({ default: m.EngagementEffects })),
);

/** Radix tooltip + toast — split from App entry so route chunks stay smaller. */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider>
      {children}
      <Suspense fallback={null}>
        <EngagementEffects />
      </Suspense>
      <Toaster />
    </TooltipProvider>
  );
}
