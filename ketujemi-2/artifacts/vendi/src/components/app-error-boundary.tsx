import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { error: Error | null };

/** Catches render/chunk errors so production never shows a silent white screen. */
export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null };
  private readonly chunkReloadKey = "__ketujemi_chunk_reload_once__";

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[KetuJemi] App failed to render", error, info.componentStack);

    // Recover from stale SW/cache after deploy: try one forced reload for chunk-load errors.
    const message = `${error?.name ?? ""} ${error?.message ?? ""}`.toLowerCase();
    const isChunkLoadError =
      message.includes("failed to fetch dynamically imported module") ||
      message.includes("importing a module script failed") ||
      message.includes("loading chunk");
    if (!isChunkLoadError || typeof window === "undefined") return;
    if (window.sessionStorage.getItem(this.chunkReloadKey) === "1") return;
    window.sessionStorage.setItem(this.chunkReloadKey, "1");
    window.location.reload();
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
        <p className="text-lg font-semibold text-foreground">Faqja nuk u ngarkua</p>
        <p className="max-w-md text-sm text-muted-foreground">
          Provo të rifreskosh faqen. Nëse problemi vazhdon, pastro cache-in e shfletuesit për ketujemi.com.
        </p>
        {import.meta.env.DEV && this.state.error?.message ? (
          <p className="max-w-lg font-mono text-xs text-red-600 break-words">
            {this.state.error.message}
          </p>
        ) : null}
        <button
          type="button"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          onClick={() => window.location.reload()}
        >
          Rifresko
        </button>
      </div>
    );
  }
}
