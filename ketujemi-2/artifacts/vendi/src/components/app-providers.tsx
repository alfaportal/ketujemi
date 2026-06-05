import type { ReactNode } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { EngagementEffects } from "@/components/engagement-effects";

/** Radix tooltip + toast — split from App entry so route chunks stay smaller. */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider>
      {children}
      <EngagementEffects />
      <Toaster />
    </TooltipProvider>
  );
}
