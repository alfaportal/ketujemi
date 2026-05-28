export type MonitorCycleError = {
  at: string;
  phase: string;
  message: string;
};

const MAX_ERRORS = 100;
const cycleErrors: MonitorCycleError[] = [];

export function recordMonitorCycleError(phase: string, err: unknown): void {
  const message = err instanceof Error ? err.message : String(err);
  cycleErrors.push({ at: new Date().toISOString(), phase, message });
  if (cycleErrors.length > MAX_ERRORS) {
    cycleErrors.splice(0, cycleErrors.length - MAX_ERRORS);
  }
}

export function getMonitorCycleErrorsSince(since: Date): MonitorCycleError[] {
  const t = since.getTime();
  return cycleErrors.filter((e) => new Date(e.at).getTime() >= t);
}

export function getRecentMonitorCycleErrors(limit = 20): MonitorCycleError[] {
  return cycleErrors.slice(-limit);
}
