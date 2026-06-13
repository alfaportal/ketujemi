import { Component, type ComponentType, type ErrorInfo, type ReactNode } from "react";
import { errorPageCopyForStoredLang } from "@/lib/error-page-i18n";
import { hasListingPostDraft } from "@/lib/listing-post-draft";

type Props = { children: ReactNode };
type State = { error: Error | null };

/** Catches render errors on the listing post form — never silent white screen. */
export class ListingPostErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[KetuJemi] Listing post form crashed", error, info.componentStack);
  }

  private retry = () => {
    this.setState({ error: null });
  };

  render() {
    if (!this.state.error) return this.props.children;

    const copy = errorPageCopyForStoredLang();
    const draftSaved = hasListingPostDraft();

    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-6 py-16 text-center">
        <p className="text-lg font-semibold text-gray-900">{copy.title}</p>
        <p className="max-w-md text-sm text-gray-600 leading-relaxed">
          {draftSaved
            ? "Fotot e ngarkuara janë ruajtur. Shtyp «Vazhdo» për të provuar përsëri pa humbur punën."
            : copy.hint}
        </p>
        <button
          type="button"
          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700"
          onClick={this.retry}
        >
          {draftSaved ? "Vazhdo" : copy.refresh}
        </button>
      </div>
    );
  }
}

export function withListingPostErrorBoundary<P extends object>(
  Inner: ComponentType<P>,
): ComponentType<P> {
  return function ListingPostWithErrorBoundary(props: P) {
    return (
      <ListingPostErrorBoundary>
        <Inner {...props} />
      </ListingPostErrorBoundary>
    );
  };
}
