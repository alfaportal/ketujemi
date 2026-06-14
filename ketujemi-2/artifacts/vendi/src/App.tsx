import { lazy, Suspense, type ComponentType } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MarketProvider } from "@/lib/market-context";
import { lazyWithRetry } from "@/lib/lazy-import-retry";
import { withListingDetailErrorBoundary } from "@/components/listing-detail-error-boundary";
import { AppProviders } from "@/components/app-providers";
import { AuthProvider } from "@/lib/auth-context";
import { AppLayout } from "@/components/app-layout";
import { RefetchOnVisible } from "@/components/refetch-on-visible";
import { RouteLoading } from "@/components/route-loading";
const GoogleAnalytics = lazy(() =>
  import("@/components/google-analytics").then((m) => ({ default: m.GoogleAnalytics })),
);
import {
  LegacyCategoryRouteRedirect,
  categoryHubRedirectComponent,
} from "@/components/category-slug-redirect";
import { RouteErrorBoundary, withRouteErrorBoundary } from "@/components/route-error-boundary";
import {
  APP_ROUTES,
  CATCH_ALL_ROUTE,
  type AppRouteDefinition,
  type RouteId,
} from "@/config/routes.config";

const Home = lazyWithRetry(() => import("@/pages/home"));
const Listings = lazyWithRetry(() => import("@/pages/listings"));
const CategoryPage = lazyWithRetry(() => import("@/pages/category"));
const ListingDetail = lazyWithRetry(async () => {
  const { default: Page } = await import("@/pages/listing-detail");
  const Wrapped = withListingDetailErrorBoundary(Page);
  return { default: Wrapped };
});
import { withListingPostErrorBoundary } from "@/components/listing-post-error-boundary";

const NewListingPage = lazyWithRetry(async () => {
  const { default: Page } = await import("@/pages/new-listing");
  const Wrapped = withListingPostErrorBoundary(Page);
  return { default: Wrapped };
});
const LoginPage = lazyWithRetry(() => import("@/pages/login"));
const ProfilePage = lazyWithRetry(() => import("@/pages/profile"));
const MyListingsPage = lazyWithRetry(() => import("@/pages/my-listings"));
const BusinessProfilePage = lazyWithRetry(() => import("@/pages/business-profile"));
const PartnerProfilePage = lazyWithRetry(() => import("@/pages/partner-profile"));
const EditListing = lazyWithRetry(() => import("@/pages/edit-listing"));
const AdminPanel = lazyWithRetry(() => import("@/pages/admin/index"));
const TermsPage = lazyWithRetry(() => import("@/pages/terms"));
const BusinessRulesPage = lazyWithRetry(() => import("@/pages/business-rules"));
const PrivacyPage = lazyWithRetry(() => import("@/pages/privacy"));
const AboutPage = lazyWithRetry(() => import("@/pages/about"));
const RulesPage = lazyWithRetry(() => import("@/pages/rules"));
const CookiesPage = lazyWithRetry(() => import("@/pages/cookies"));
const ContactPage = lazyWithRetry(() => import("@/pages/contact"));
const FaqPage = lazyWithRetry(() => import("@/pages/faq"));
const SecurityPage = lazyWithRetry(() => import("@/pages/security"));
const PressPage = lazyWithRetry(() => import("@/pages/press"));
const VipPackagesPage = lazyWithRetry(() => import("@/pages/vip-packages"));
const AdvertisePage = lazyWithRetry(() => import("@/pages/advertise"));
const PartnerRegisterPage = lazyWithRetry(() => import("@/pages/partner"));
const OpenShopPage = lazyWithRetry(() => import("@/pages/hap-shitore"));
const OpenShopApplyPage = lazyWithRetry(() => import("@/pages/hap-shitore-apliko"));
const ShopDetailPage = lazyWithRetry(() => import("@/pages/shop-detail"));
const ShopDirectoryPage = lazyWithRetry(() => import("@/pages/shop-directory"));
const ShopDirectoryCategoryPage = lazyWithRetry(() => import("@/pages/shop-directory-category"));
const ShopDirectorySubcategoryPage = lazyWithRetry(() => import("@/pages/shop-directory-subcategory"));
const WalletBankPaymentPage = lazyWithRetry(() => import("@/pages/wallet-bank-payment"));
const NotFound = lazyWithRetry(() => import("@/pages/not-found"));

const ROUTE_COMPONENTS: Record<Exclude<RouteId, "category-hub-redirect">, ComponentType> = {
  admin: AdminPanel,
  login: LoginPage,
  profile: ProfilePage,
  "my-listings": MyListingsPage,
  "wallet-bank-payment": WalletBankPaymentPage,
  "business-profile": BusinessProfilePage,
  "partner-profile": PartnerProfilePage,
  about: AboutPage,
  rules: RulesPage,
  privacy: PrivacyPage,
  cookies: CookiesPage,
  terms: TermsPage,
  "business-rules": BusinessRulesPage,
  contact: ContactPage,
  faq: FaqPage,
  security: SecurityPage,
  press: PressPage,
  "partner-register": PartnerRegisterPage,
  "open-shop": OpenShopPage,
  "open-shop-apply": OpenShopApplyPage,
  "vip-packages": VipPackagesPage,
  advertise: AdvertisePage,
  home: Home,
  "legacy-category-redirect": LegacyCategoryRouteRedirect,
  "category-seo": CategoryPage,
  category: CategoryPage,
  "new-listing": NewListingPage,
  "edit-listing": EditListing,
  "shop-detail": ShopDetailPage,
  "shop-directory": ShopDirectoryPage,
  "shop-directory-subcategory": ShopDirectorySubcategoryPage,
  "shop-directory-category": ShopDirectoryCategoryPage,
  "listing-detail": ListingDetail,
  listings: Listings,
  "not-found": NotFound,
};

const SAFE_ROUTE_COMPONENTS = Object.fromEntries(
  Object.entries(ROUTE_COMPONENTS).map(([id, Comp]) => [id, withRouteErrorBoundary(Comp)]),
) as Record<Exclude<RouteId, "category-hub-redirect">, ComponentType>;

function resolveRouteComponent(route: AppRouteDefinition): ComponentType {
  if (route.id === "category-hub-redirect" && route.hubSlug) {
    return withRouteErrorBoundary(categoryHubRedirectComponent(route.hubSlug));
  }
  return SAFE_ROUTE_COMPONENTS[route.id as Exclude<RouteId, "category-hub-redirect">];
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      structuralSharing: true,
    },
  },
});

function Router() {
  return (
    <AppLayout>
      <main>
        <Suspense fallback={<RouteLoading />}>
          <Switch>
            {APP_ROUTES.map((route) => (
              <Route
                key={`${route.id}:${route.path}`}
                path={route.path}
                component={resolveRouteComponent(route)}
              />
            ))}
            <Route
              component={
                SAFE_ROUTE_COMPONENTS[
                  CATCH_ALL_ROUTE.id as Exclude<RouteId, "category-hub-redirect">
                ]
              }
            />
          </Switch>
        </Suspense>
      </main>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RefetchOnVisible />
      <AuthProvider>
        <AppProviders>
          <MarketProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Suspense fallback={null}>
                <GoogleAnalytics />
              </Suspense>
              <RouteErrorBoundary>
                <Router />
              </RouteErrorBoundary>
            </WouterRouter>
          </MarketProvider>
        </AppProviders>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
