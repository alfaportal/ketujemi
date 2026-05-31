import { lazy, Suspense } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
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
import { PARENT_CATEGORY_SLUG_ORDER } from "@/lib/parent-category-slugs";

const Home = lazy(() => import("@/pages/home"));
const Listings = lazy(() => import("@/pages/listings"));
const CategoryPage = lazy(() => import("@/pages/category"));
const ListingDetail = lazy(() => import("@/pages/listing-detail"));
const NewListing = lazy(() => import("@/pages/new-listing"));
const LoginPage = lazy(() => import("@/pages/login"));
const ProfilePage = lazy(() => import("@/pages/profile"));
const BusinessProfilePage = lazy(() => import("@/pages/business-profile"));
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
const WalletBankPaymentPage = lazy(() => import("@/pages/wallet-bank-payment"));
const NotFound = lazy(() => import("@/pages/not-found"));

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
  const [pathname] = useLocation();

  return (
    <AppLayout>
      <main key={pathname}>
        <Suspense fallback={<RouteLoading />}>
          <Switch>
            <Route path="/admin" component={AdminPanel} />
            <Route path="/admin-secret-panel" component={AdminPanel} />
            <Route path="/login" component={LoginPage} />
            <Route path="/profile" component={ProfilePage} />
            <Route path="/wallet/bank-payment" component={WalletBankPaymentPage} />
            <Route path="/biznes/:id" component={BusinessProfilePage} />
            <Route path="/rreth-nesh" component={AboutPage} />
            <Route path="/za-nas" component={AboutPage} />
            <Route path="/o-nama" component={AboutPage} />
            <Route path="/rregullat" component={RulesPage} />
            <Route path="/pravila" component={RulesPage} />
            <Route path="/privatesia" component={PrivacyPage} />
            <Route path="/privatnost" component={PrivacyPage} />
            <Route path="/cookies" component={CookiesPage} />
            <Route path="/kolacinja" component={CookiesPage} />
            <Route path="/kolacici" component={CookiesPage} />
            <Route path="/kushtet" component={TermsPage} />
            <Route path="/uslovi" component={TermsPage} />
            <Route path="/terms" component={TermsPage} />
            <Route path="/business-rules" component={BusinessRulesPage} />
            <Route path="/privacy" component={PrivacyPage} />
            <Route path="/contact" component={ContactPage} />
            <Route path="/kontakt" component={ContactPage} />
            <Route path="/faq" component={FaqPage} />
            <Route path="/siguria" component={SecurityPage} />
            <Route path="/bezbednost" component={SecurityPage} />
            <Route path="/sigurnost" component={SecurityPage} />
            <Route path="/shtypi" component={PressPage} />
            <Route path="/mediji" component={PressPage} />
            <Route path="/hap-shitore" component={PartnerRegisterPage} />
            <Route path="/otvori-prodavnica" component={PartnerRegisterPage} />
            <Route path="/otvori-prodavnicu" component={PartnerRegisterPage} />
            <Route path="/vip" component={VipPackagesPage} />
            <Route path="/reklamoni" component={AdvertisePage} />
            <Route path="/reklamiraj" component={AdvertisePage} />
            <Route path="/partner" component={PartnerRegisterPage} />
            <Route path="/partneritet" component={PartnerRegisterPage} />
            <Route path="/partnerstvo" component={PartnerRegisterPage} />
            <Route path="/behu-partner" component={ProfilePage} />
            <Route path="/" component={Home} />
            <Route path="/category/:id" component={LegacyCategoryRouteRedirect} />
            {PARENT_CATEGORY_SLUG_ORDER.map((slug) => (
              <Route
                key={`hub-${slug}`}
                path={`/${slug}`}
                component={categoryHubRedirectComponent(slug)}
              />
            ))}
            <Route path="/categories/:id" component={CategoryPage} />
            <Route path="/listings/new" component={NewListing} />
            <Route path="/listings/:id/edit" component={EditListing} />
            <Route path="/listings/:id" component={ListingDetail} />
            <Route path="/listings" component={Listings} />
            <Route component={NotFound} />
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
                <Router />
              </WouterRouter>
            </MarketProvider>
          </AppProviders>
        </Suspense>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
