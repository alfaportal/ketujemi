import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MarketProvider } from "@/lib/market-context";
import Home from "@/pages/home";
import Listings from "@/pages/listings";
import CategoryPage from "@/pages/category";
import ListingDetail from "@/pages/listing-detail";
import NewListing from "@/pages/new-listing";
import LoginPage from "@/pages/login";
import ProfilePage from "@/pages/profile";
import BusinessProfilePage from "@/pages/business-profile";
import { AuthProvider } from "@/lib/auth-context";
import EditListing from "@/pages/edit-listing";
import AdminPanel from "@/pages/admin/index";
import TermsPage from "@/pages/terms";
import BusinessRulesPage from "@/pages/business-rules";
import PrivacyPage from "@/pages/privacy";
import ContactPage from "@/pages/contact";
import FaqPage from "@/pages/faq";
import SecurityPage from "@/pages/security";
import PressPage from "@/pages/press";
import NotFound from "@/pages/not-found";
import { AppLayout } from "@/components/app-layout";
import { RefetchOnVisible } from "@/components/refetch-on-visible";

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
        <Switch>
          <Route path="/admin-secret-panel" component={AdminPanel} />
          <Route path="/login" component={LoginPage} />
          <Route path="/profile" component={ProfilePage} />
          <Route path="/biznes/:id" component={BusinessProfilePage} />
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
          <Route path="/" component={Home} />
          <Route path="/categories/:id" component={CategoryPage} />
          <Route path="/listings/new" component={NewListing} />
          <Route path="/listings/:id/edit" component={EditListing} />
          <Route path="/listings/:id" component={ListingDetail} />
          <Route path="/listings" component={Listings} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RefetchOnVisible />
      <AuthProvider>
        <TooltipProvider>
          <MarketProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
          </MarketProvider>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
