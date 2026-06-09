import { useLocation } from "wouter";
import { useAuth, loginUrlWithReturn } from "@/lib/auth-context";
import { KERKOJ_POST_PATH } from "@/lib/special-listing-categories";

const DEFAULT_POST_PATH = "/listings/new";

export type GoToPostListingOptions = {
  /** Target post form (default `/listings/new`). */
  postPath?: string;
};

/**
 * Guests go to login and return to the post form; logged-in users open the post form.
 */
export function useGoToPostListing(options?: GoToPostListingOptions) {
  const [, setLocation] = useLocation();
  const { user, loading } = useAuth();
  const postPath = options?.postPath ?? DEFAULT_POST_PATH;

  return () => {
    if (loading) return;
    if (!user) {
      setLocation(loginUrlWithReturn(postPath));
      return;
    }
    setLocation(postPath);
  };
}

/** Navigate to the Kërkoj të Blej buyer-request form. */
export function useGoToKerkojPostListing() {
  return useGoToPostListing({ postPath: KERKOJ_POST_PATH });
}
