import { Component, type ErrorInfo, type ReactNode } from "react";
import { errorPageCopyForStoredLang } from "@/lib/error-page-i18n";

type Props = { children: ReactNode };
type State = { error: Error | null; recovering: boolean };

function isChunkLoadError(error: Error | null): boolean {
  const message = `${error?.name ?? ""} ${error?.message ?? ""}`.toLowerCase();
  return (
    message.includes("failed to fetch dynamically imported module")
    || message.includes("importing a module script failed")
    || message.includes("loading chunk")
    || message.includes("dynamically imported module")
  );
}

/** Catches render/chunk errors — never auto-reloads (that caused listing detail refresh loops). */
export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null, recovering: false };

  static getDerivedStateFromError(error: Error): State {
    return { error, recovering: false };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[KetuJemi] App failed to render", error, info.componentStack);
  }

  private clearCachesAndReload = async () => {
    this.setState({ recovering: true });
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
      console.warn("[KetuJemi] manual cache recovery failed", e);
    } finally {
      window.location.reload();
    }
  };

  private resetBoundary = () => {
    this.setState({ error: null, recovering: false });
  };

  render() {
    if (!this.state.error) return this.props.children;

    const copy = errorPageCopyForStoredLang();
    const chunkError = isChunkLoadError(this.state.error);

    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
        <p className="text-lg font-semibold text-foreground">{copy.title}</p>
        <p className="max-w-md text-sm text-muted-foreground">
          {chunkError
            ? "Version i vjetër i faqes. Pastro cache-in dhe rifresko."
            : copy.hint}
        </p>
        {this.state.error?.message ? (
          <p className="max-w-lg font-mono text-xs text-red-600 break-words">
            {this.state.error.message}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            disabled={this.state.recovering}
            onClick={() => void this.clearCachesAndReload()}
          >
            {this.state.recovering ? "…" : chunkError ? "Pastro & rifresko" : copy.refresh}
          </button>
          {!chunkError ? (
            <button
              type="button"
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
              onClick={this.resetBoundary}
            >
              Provo përsëri
            </button>
          ) : null}
        </div>
      </div>
    );
  }
}
