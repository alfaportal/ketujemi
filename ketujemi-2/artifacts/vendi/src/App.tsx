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
import { AuthProvider } from "@/lib/auth-context";
import EditListing from "@/pages/edit-listing";
import AdminPanel from "@/pages/admin/index";
import TermsPage from "@/pages/terms";
import PrivacyPage from "@/pages/privacy";
import ContactPage from "@/pages/contact";
import FaqPage from "@/pages/faq";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function Router() {
  return (
    <div className="min-h-screen bg-background">
      <main>
        <Switch>
          <Route path="/admin-secret-panel" component={AdminPanel} />
          <Route path="/login" component={LoginPage} />
          <Route path="/profile" component={ProfilePage} />
          <Route path="/terms" component={TermsPage} />
          <Route path="/privacy" component={PrivacyPage} />
          <Route path="/contact" component={ContactPage} />
          <Route path="/faq" component={FaqPage} />
          <Route path="/" component={Home} />
          <Route path="/categories/:id" component={CategoryPage} />
          <Route path="/listings/new" component={NewListing} />
          <Route path="/listings/:id/edit" component={EditListing} />
          <Route path="/listings/:id" component={ListingDetail} />
          <Route path="/listings" component={Listings} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
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
