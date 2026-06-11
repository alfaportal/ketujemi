import { Component, type ErrorInfo, type ReactNode } from "react";
import { errorPageCopyForStoredLang } from "@/lib/error-page-i18n";
import { isListingPostPath } from "@/lib/listing-form-draft";

type Props = { children: ReactNode };
type State = { error: Error | null };

/** Catches render/chunk errors so production never shows a silent white screen. */
export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null };
  private readonly chunkReloadKey = "__ketujemi_chunk_recover_once__";

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[KetuJemi] App failed to render", error, info.componentStack);

    // Recover from stale SW/cache after deploy.
    const message = `${error?.name ?? ""} ${error?.message ?? ""}`.toLowerCase();
    const isChunkLoadError =
      message.includes("failed to fetch dynamically imported module") ||
      message.includes("importing a module script failed") ||
      message.includes("loading chunk");
    if (!isChunkLoadError || typeof window === "undefined") return;
    if (isListingPostPath(window.location.pathname)) return;
    if (window.sessionStorage.getItem(this.chunkReloadKey) === "1") return;
    window.sessionStorage.setItem(this.chunkReloadKey, "1");
    void this.recoverFromStaleCache();
  }

  private async recoverFromStaleCache() {
    try {
      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
      }
      if ("caches" in window) {
        const names = await caches.keys();
        await Promise.all(names.map((n) => caches.delete(n)));
      }
    } catch (e) {
      console.warn("[KetuJemi] stale cache recovery failed", e);
    } finally {
      const url = new URL(window.location.href);
      url.searchParams.set("__recover", Date.now().toString());
      window.location.replace(url.toString());
    }
  }

  render() {
    if (!this.state.error) return this.props.children;

    const copy = errorPageCopyForStoredLang();

    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
        <p className="text-lg font-semibold text-foreground">{copy.title}</p>
        <p className="max-w-md text-sm text-muted-foreground">{copy.hint}</p>
        {this.state.error?.message ? (
          <p className="max-w-lg font-mono text-xs text-red-600 break-words">
            {this.state.error.message}
          </p>
        ) : null}
        <button
          type="button"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          onClick={() => window.location.reload()}
        >
          {copy.refresh}
        </button>
      </div>
    );
  }
}
