import { useEffect, useState, type ReactNode } from "react";
import { CreditCard, Loader2 } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  fetchPaymentsStatus,
  redirectToStripeCheckout,
  type StripeCheckoutPurpose,
} from "@/lib/stripe-checkout";
import { useMarket } from "@/lib/market-context";

export type PayWithCardButtonProps = Omit<ButtonProps, "onClick"> & {
  purpose: StripeCheckoutPurpose;
  listingId?: number;
  children: ReactNode;
  /** Hide button when Stripe is not configured (default true). */
  hideWhenUnavailable?: boolean;
};

export function PayWithCardButton({
  purpose,
  listingId,
  children,
  hideWhenUnavailable = false,
  disabled,
  className,
  variant,
  ...rest
}: PayWithCardButtonProps) {
  const { t, uiLang } = useMarket();
  const tx = t as Record<string, string>;
  const { toast } = useToast();
  const [available, setAvailable] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetchPaymentsStatus()
      .then(({ cardPaymentsAvailable }) => {
        if (!cancelled) setAvailable(cardPaymentsAvailable);
      })
      .catch(() => {
        if (!cancelled) setAvailable(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (available === null && hideWhenUnavailable) return null;
  if (!available && hideWhenUnavailable) return null;

  const paymentsOff = available === false;
  const statusLoading = available === null;

  return (
    <Button
      type="button"
      variant={variant ?? "default"}
      className={className}
      disabled={disabled || busy || paymentsOff || statusLoading}
      title={paymentsOff ? tx.ui_cardPaymentDisabled : undefined}
      onClick={() => {
        setBusy(true);
        void redirectToStripeCheckout(
          {
            purpose,
            ...(listingId != null ? { listing_id: listingId } : {}),
          },
          uiLang,
        ).catch((e) => {
          toast({
            title: e instanceof Error ? e.message : tx.ui_cardPaymentUnavailable,
            variant: "destructive",
          });
        }).finally(() => setBusy(false));
      }}
      {...rest}
    >
      {busy ? (
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
      ) : (
        <CreditCard className="h-4 w-4 mr-2 shrink-0" aria-hidden />
      )}
      {children}
    </Button>
  );
}
