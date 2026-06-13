import { Component, type ErrorInfo, type ReactNode } from "react";
import { readListingDraftImageUrls } from "@/lib/listing-post-draft";

type Props = {
  children: ReactNode;
  onRetry?: () => void;
};

type State = { error: Error | null };

/** Isolates photo-upload UI — a crash here must not blank the whole post form. */
export class ListingPhotoUploadBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[KetuJemi] Photo upload section error", error, info.componentStack);
  }

  private retry = () => {
    this.setState({ error: null });
    this.props.onRetry?.();
  };

  render() {
    if (!this.state.error) return this.props.children;

    const saved = readListingDraftImageUrls().length;

    return (
      <div
        className="rounded-2xl border border-amber-200 bg-amber-50 p-5 space-y-3"
        role="alert"
        data-testid="listing-photo-upload-error"
      >
        <p className="text-sm font-bold text-amber-950">
          Ngarkimi i fotove u ndërpre — provo përsëri
        </p>
        <p className="text-sm text-amber-900 leading-relaxed">
          {saved > 0
            ? `${saved} foto janë ruajtur. Shtyp butonin më poshtë dhe vazhdo.`
            : "Forma mbetet e hapur. Zgjidh fotot përsëri nga galeria ose kamera."}
        </p>
        <button
          type="button"
          onClick={this.retry}
          className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
        >
          Provo përsëri ngarkimin
        </button>
      </div>
    );
  }
}
