import { lazy, Suspense, type ComponentType } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MarketProvider } from "@/lib/market-context";

const AppProviders = lazy(() =>
  import("@/components/app-providers").then((m) => ({ default: m.AppProviders })),
);
import { AuthProvider } from "@/lib/auth-context";
import { AppLayout } from "@/components/app-layout";
import { RefetchOnVisible } from "@/components/refetch-on-visible";
import { RouteLoading } from "@/components/route-loading";
import { GoogleAnalytics } from "@/components/google-analytics";
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

const Home = lazy(() => import("@/pages/home"));
const Listings = lazy(() => import("@/pages/listings"));
const CategoryPage = lazy(() => import("@/pages/category"));
const ListingDetail = lazy(() => import("@/pages/listing-detail"));

const NewListing = lazy(() => import("@/pages/new-listing"));
const LoginPage = lazy(() => import("@/pages/login"));
const ProfilePage = lazy(() => import("@/pages/profile"));
const MyListingsPage = lazy(() => import("@/pages/my-listings"));
const BusinessProfilePage = lazy(() => import("@/pages/business-profile"));
const PartnerProfilePage = lazy(() => import("@/pages/partner-profile"));
const EditListing = lazy(() => import("@/pages/edit-listing"));
const AdminPanel = lazy(() => import("@/pages/admin/index"));
const TermsPage = lazy(() => import("@/pages/terms"));
const BusinessRulesPage = lazy(() => import("@/pages/business-rules"));
const PrivacyPage = lazy(() => import("@/pages/privacy"));
const AboutPage = lazy(() => import("@/pages/about"));
const RulesPage = lazy(() => import("@/pages/rules"));
const CookiesPage = lazy(() => import("@/pages/cookies"));
const ContactPage = lazy(() => import("@/pages/contact"));
const FaqPage = lazy(() => import("@/pages/faq"));
const SecurityPage = lazy(() => import("@/pages/security"));
const PressPage = lazy(() => import("@/pages/press"));
const VipPackagesPage = lazy(() => import("@/pages/vip-packages"));
const AdvertisePage = lazy(() => import("@/pages/advertise"));
const PartnerRegisterPage = lazy(() => import("@/pages/partner"));
const OpenShopPage = lazy(() => import("@/pages/hap-shitore"));
const OpenShopApplyPage = lazy(() => import("@/pages/hap-shitore-apliko"));
const ShopDetailPage = lazy(() => import("@/pages/shop-detail"));
const ShopDirectoryPage = lazy(() => import("@/pages/shop-directory"));
const ShopDirectoryCategoryPage = lazy(() => import("@/pages/shop-directory-category"));
const ShopDirectorySubcategoryPage = lazy(() => import("@/pages/shop-directory-subcategory"));
const WalletBankPaymentPage = lazy(() => import("@/pages/wallet-bank-payment"));
const NotFound = lazy(() => import("@/pages/not-found"));

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
  "new-listing": NewListing,
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
      staleTime: 0,
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
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
        <Suspense fallback={<RouteLoading />}>
          <AppProviders>
            <MarketProvider>
              <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                <GoogleAnalytics />
                <RouteErrorBoundary>
                  <Router />
                </RouteErrorBoundary>
              </WouterRouter>
            </MarketProvider>
          </AppProviders>
        </Suspense>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
