import { Component, type ComponentType, type ErrorInfo, type ReactNode } from "react";
import { EXTRA_TRANSLATIONS } from "@/lib/app-extra-i18n";
import { isListingPostPath } from "@/lib/listing-post-path";
import { DEFAULT_UI_LANG, isUiLang, translationKeyForUiLang } from "@/lib/ui-languages";

type Props = { children: ReactNode };
type State = { error: Error | null };

type SectionErrorCopy = {
  title: string;
  hint: string;
  refresh: string;
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
  let uiLang = DEFAULT_UI_LANG;
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("vendi_ui_lang");
      if (saved && isUiLang(saved)) uiLang = saved;
    } catch {
      /* ignore */
    }
  }
  const bundle = EXTRA_TRANSLATIONS[translationKeyForUiLang(uiLang)];
  return {
    title: bundle.ui_routeErrorTitle,
    hint: bundle.ui_routeErrorHint,
    refresh: bundle.ui_routeErrorRefresh,
  };
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

    const pathKey = currentRouteKey();
    if (!pathKey || wasAutoRecoveryAttempted(pathKey)) return;
    if (isListingPostPath(pathKey.split("?")[0] ?? "")) return;
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
