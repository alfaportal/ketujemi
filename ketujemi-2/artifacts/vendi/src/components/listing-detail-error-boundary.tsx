import { Component, type ComponentType, type ErrorInfo, type ReactNode } from "react";
import { listingDetailErrorCopyForStoredLang } from "@/lib/error-page-i18n";

type Props = { children: ReactNode };
type State = { error: Error | null };

/** Listing detail — never auto-reloads; local retry only. */
export class ListingDetailErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[KetuJemi] Listing detail crashed", error, info.componentStack);
  }

  private retry = () => {
    this.setState({ error: null });
  };

  render() {
    if (!this.state.error) return this.props.children;

    const copy = listingDetailErrorCopyForStoredLang();

    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 py-16 text-center">
        <p className="text-lg font-semibold text-gray-900">{copy.title}</p>
        <p className="max-w-md text-sm text-gray-600">{copy.subtitle}</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700"
            onClick={this.retry}
          >
            {copy.retry}
          </button>
          <a
            href="/listings"
            className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50"
          >
            {copy.backToList}
          </a>
        </div>
      </div>
    );
  }
}

export function withListingDetailErrorBoundary<P extends object>(
  Inner: ComponentType<P>,
): ComponentType<P> {
  return function ListingDetailWithErrorBoundary(props: P) {
    return (
      <ListingDetailErrorBoundary>
        <Inner {...props} />
      </ListingDetailErrorBoundary>
    );
  };
}
