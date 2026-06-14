import { Component, type ComponentType, type ErrorInfo, type ReactNode } from "react";
import { DEFAULT_UI_LANG, isUiLang, translationKeyForUiLang } from "@/lib/ui-languages";

type Props = { children: ReactNode };
type State = { error: Error | null };

type SectionErrorCopy = {
  title: string;
  hint: string;
  retry: string;
  refresh: string;
};

/** Minimal copy — avoid importing the full i18n-extra bundle on every page load. */
const ROUTE_ERROR_COPY: Record<string, SectionErrorCopy> = {
  ks: {
    title: "Diçka shkoi keq",
    hint: "Provo përsëri ose rifresko faqen.",
    retry: "Provo përsëri",
    refresh: "Rifresko",
  },
  al: {
    title: "Diçka shkoi keq",
    hint: "Provo përsëri ose rifresko faqen.",
    retry: "Provo përsëri",
    refresh: "Rifresko",
  },
  mk: {
    title: "Нешто тргна наопаку",
    hint: "Обидете се повторно или освежете ја страницата.",
    retry: "Обиди се повторно",
    refresh: "Освежи",
  },
  mne: {
    title: "Nešto je pošlo po zlu",
    hint: "Pokušajte ponovo ili osvježite stranicu.",
    retry: "Pokušaj ponovo",
    refresh: "Osvježi",
  },
  en: {
    title: "Something went wrong",
    hint: "Try again or refresh the page.",
    retry: "Try again",
    refresh: "Refresh",
  },
};

function sectionErrorCopyForStoredLang(): SectionErrorCopy {
  let uiLang = DEFAULT_UI_LANG;
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("vendi_ui_lang");
      if (saved && isUiLang(saved)) uiLang = saved;
    } catch {
      /* ignore */
    }
  }
  return ROUTE_ERROR_COPY[translationKeyForUiLang(uiLang)] ?? ROUTE_ERROR_COPY.ks;
}

/** Scoped fallback for category, search, and listing detail routes. Never auto-reloads — that caused refresh loops. */
export class RouteErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[KetuJemi] Route section failed to render", error, info.componentStack);
  }

  private resetBoundary = () => {
    this.setState({ error: null });
  };

  render() {
    if (!this.state.error) return this.props.children;

    const copy = sectionErrorCopyForStoredLang();

    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 py-16 text-center">
        <p className="text-lg font-semibold text-gray-900">{copy.title}</p>
        <p className="max-w-md text-sm text-gray-600">{copy.hint}</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            className="rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            onClick={this.resetBoundary}
          >
            {copy.retry}
          </button>
          <button
            type="button"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
            onClick={() => window.location.reload()}
          >
            {copy.refresh}
          </button>
        </div>
      </div>
    );
  }
}

export function withRouteErrorBoundary<P extends object>(Inner: ComponentType<P>): ComponentType<P> {
  return function RouteWithErrorBoundary(props: P) {
    return (
      <RouteErrorBoundary>
        <Inner {...props} />
      </RouteErrorBoundary>
    );
  };
}
