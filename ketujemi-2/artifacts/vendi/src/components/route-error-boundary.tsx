import { Component, type ComponentType, type ErrorInfo, type ReactNode } from "react";
import * as Sentry from "@sentry/react";
import { DEFAULT_UI_LANG, isUiLang, type UiLang } from "@/lib/ui-languages";

type Props = { children: ReactNode };
type State = { error: Error | null };

type SectionErrorCopy = {
  title: string;
  hint: string;
  refresh: string;
};

const SECTION_ERROR_COPY: Record<UiLang, SectionErrorCopy> = {
  sq: {
    title: "Diçka shkoi keq",
    hint: "Rifresko faqen.",
    refresh: "Rifresko",
  },
  mk: {
    title: "Нешто тргна наопаку",
    hint: "Освежете ја страницата.",
    refresh: "Освежи",
  },
  mne: {
    title: "Nešto je pošlo po zlu",
    hint: "Osvježite stranicu.",
    refresh: "Osvježi",
  },
  en: {
    title: "Something went wrong",
    hint: "Refresh the page.",
    refresh: "Refresh",
  },
};

const AUTO_RECOVER_KEY = "vendi_route_error_autorecover_path";

function currentRouteKey(): string {
  if (typeof window === "undefined") return "";
  return `${window.location.pathname}${window.location.search}`;
}

function markAutoRecoveryAttempt(pathKey: string): void {
  if (typeof window === "undefined" || !pathKey) return;
  try {
    sessionStorage.setItem(AUTO_RECOVER_KEY, pathKey);
  } catch {
    /* ignore */
  }
}

function wasAutoRecoveryAttempted(pathKey: string): boolean {
  if (typeof window === "undefined" || !pathKey) return false;
  try {
    return sessionStorage.getItem(AUTO_RECOVER_KEY) === pathKey;
  } catch {
    return false;
  }
}

function clearAutoRecoveryAttempt(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(AUTO_RECOVER_KEY);
  } catch {
    /* ignore */
  }
}

function sectionErrorCopyForStoredLang(): SectionErrorCopy {
  if (typeof window === "undefined") return SECTION_ERROR_COPY[DEFAULT_UI_LANG];
  try {
    const saved = localStorage.getItem("vendi_ui_lang");
    if (saved && isUiLang(saved)) return SECTION_ERROR_COPY[saved];
  } catch {
    /* ignore */
  }
  return SECTION_ERROR_COPY[DEFAULT_UI_LANG];
}

/** Scoped fallback for category, search, and listing detail routes. */
export class RouteErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  componentDidMount() {
    if (!this.state.error) clearAutoRecoveryAttempt();
  }

  componentDidUpdate(_prevProps: Props, prevState: State) {
    if (prevState.error && !this.state.error) {
      clearAutoRecoveryAttempt();
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[KetuJemi] Route section failed to render", error, info.componentStack);
    Sentry.captureException(error, {
      tags: { boundary: "route" },
      extra: { componentStack: info.componentStack },
    });

    const pathKey = currentRouteKey();
    if (!pathKey || wasAutoRecoveryAttempted(pathKey)) return;
    markAutoRecoveryAttempt(pathKey);
    window.setTimeout(() => window.location.reload(), 120);
  }

  render() {
    if (!this.state.error) return this.props.children;

    const copy = sectionErrorCopyForStoredLang();

    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 py-16 text-center">
        <p className="text-lg font-semibold text-gray-900">{copy.title}</p>
        <p className="max-w-md text-sm text-gray-600">{copy.hint}</p>
        <button
          type="button"
          className="rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          onClick={() => window.location.reload()}
        >
          {copy.refresh}
        </button>
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
