import { useLocation } from "wouter";
import { useAuth, loginUrlWithReturn } from "@/lib/auth-context";

const POST_PATH = "/listings/new";

/**
 * Guests go to login and return to the page they were on; logged-in users open the post form.
 */
export function useGoToPostListing() {
  const [, setLocation] = useLocation();
  const { user, loading } = useAuth();

  return () => {
    if (loading) return;
    if (!user) {
      const returnTo =
        typeof window !== "undefined"
          ? `${window.location.pathname}${window.location.search}`
          : "/";
      setLocation(loginUrlWithReturn(returnTo));
      return;
    }
    setLocation(POST_PATH);
  };
}
