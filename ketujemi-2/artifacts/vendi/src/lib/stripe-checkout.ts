import { loadStripe, type Stripe } from "@stripe/stripe-js";

const BUILD_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY?.trim() ?? "";

export type StripeCheckoutPurpose =
  | "vip_month"
  | "top_listing_s"
  | "top_listing_m"
  | "top_listing_l";

export type CreateCheckoutSessionBody = {
  purpose: StripeCheckoutPurpose;
  listing_id?: number;
};

export type CreateCheckoutSessionResponse = {
  url?: string;
  token?: string;
  sessionId?: string | null;
  message?: string;
  error?: string;
};

let publishableKeyCache: string | null = BUILD_PUBLISHABLE_KEY || null;
let publishableKeyFetch: Promise<string | null> | null = null;

/** Publishable key from Vite env or `/api/config/public`. */
export async function getStripePublishableKey(): Promise<string | null> {
  if (publishableKeyCache) return publishableKeyCache;
  if (!publishableKeyFetch) {
    publishableKeyFetch = fetch("/api/config/public", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : {}))
      .then((data: { stripePublishableKey?: string }) => {
        const key = data.stripePublishableKey?.trim() ?? "";
        publishableKeyCache = key || null;
        return publishableKeyCache;
      })
      .catch(() => null);
  }
  return publishableKeyFetch;
}

export type PaymentsStatus = {
  /** True when Stripe keys are set OR dev bypass is on (local testing). */
  cardPaymentsAvailable: boolean;
  stripeConfigured: boolean;
  devBypass: boolean;
  phase2: boolean;
  stripePublishableKey: string | null;
};

export async function fetchPaymentsStatus(): Promise<PaymentsStatus> {
  const res = await fetch("/api/payments/status", { credentials: "include" });
  const data = (await res.json().catch(() => ({}))) as {
    stripe?: boolean;
    devBypass?: boolean;
    phase2?: boolean;
    stripePublishableKey?: string | null;
  };
  const pk = data.stripePublishableKey?.trim() ?? (await getStripePublishableKey());
  if (pk) publishableKeyCache = pk;
  const stripeConfigured = !!data.stripe;
  const devBypass = !!data.devBypass;
  return {
    cardPaymentsAvailable: stripeConfigured || devBypass,
    stripeConfigured,
    devBypass,
    phase2: !!data.phase2,
    stripePublishableKey: pk,
  };
}

/** Create a Stripe Checkout session on the server. */
export async function createCheckoutSession(
  body: CreateCheckoutSessionBody,
): Promise<CreateCheckoutSessionResponse> {
  const res = await fetch("/api/create-checkout-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as CreateCheckoutSessionResponse & {
    message?: string;
  };
  if (!res.ok) {
    throw new Error(data.message ?? data.error ?? "Pagesa me kartë dështoi");
  }
  return data;
}

let stripePromise: Promise<Stripe | null> | null = null;

function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    stripePromise = getStripePublishableKey().then((pk) => (pk ? loadStripe(pk) : null));
  }
  return stripePromise;
}

type StripeWithLegacyCheckout = Stripe & {
  redirectToCheckout?: (options: {
    sessionId: string;
  }) => Promise<{ error?: { message?: string } }>;
};

/**
 * Start Stripe Checkout — redirects the browser to Stripe's hosted payment page.
 * Uses `session.url` (Stripe.js v9+). If an older Stripe.js build exposes
 * `redirectToCheckout({ sessionId })`, that path is tried when URL is missing.
 */
export async function redirectToStripeCheckout(body: CreateCheckoutSessionBody): Promise<void> {
  const session = await createCheckoutSession(body);

  if (session.url) {
    window.location.href = session.url;
    return;
  }

  if (session.sessionId) {
    const stripe = (await getStripe()) as StripeWithLegacyCheckout | null;
    if (stripe?.redirectToCheckout) {
      const { error } = await stripe.redirectToCheckout({ sessionId: session.sessionId });
      if (error) {
        throw new Error(error.message ?? "Stripe redirect failed");
      }
      return;
    }
  }

  throw new Error("Nuk u krijua sesioni i pagesës");
}

export type ConfirmStripeSessionResult = {
  ok: boolean;
  paid: boolean;
  purpose: string | null;
  partner_id: string | null;
  activation_code: string | null;
};

/** Confirm payment after Stripe redirect (backup when webhook is slow). */
export async function confirmStripeCheckoutSession(
  sessionId: string,
): Promise<ConfirmStripeSessionResult> {
  const res = await fetch("/api/payments/confirm-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ session_id: sessionId }),
  });
  const data = (await res.json().catch(() => ({}))) as ConfirmStripeSessionResult & {
    error?: string;
  };
  if (!res.ok) {
    throw new Error(data.error ?? "Konfirmimi i pagesës dështoi");
  }
  return data;
}

/** Read `session_id` from current URL (Stripe success redirect). */
export function stripeSessionIdFromLocation(): string | null {
  if (typeof window === "undefined") return null;
  const id = new URLSearchParams(window.location.search).get("session_id")?.trim() ?? "";
  return id.startsWith("cs_") ? id : null;
}
