import { registerSW } from "virtual:pwa-register";

/** Check for new builds and reload so users never stay on an old app shell. */
export function setupPwaUpdates(): void {
  if (!import.meta.env.PROD) return;

  const updateSW = registerSW({
    immediate: true,
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return;
      const check = () => void registration.update();
      check();
      window.setInterval(check, 60 * 60 * 1000);
    },
    onNeedRefresh() {
      void updateSW(true);
    },
  });
}
