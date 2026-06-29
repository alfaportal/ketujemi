import { useEffect, useState } from "react";
import { Download, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { BRAND_BLUE } from "@/lib/brand-colors";
import { cn } from "@/lib/utils";
import {
  getShopInstallPrompt,
  isIosSafari,
  isShopPwaStandalone,
  listenForPwaInstallPrompt,
  triggerPwaInstallPrompt,
} from "@/lib/shop-pwa";
import { useShopPwaCopy } from "@/lib/shop-pwa-i18n";

type Props = {
  shopName: string;
  className?: string;
  variant?: "hero" | "bar";
};

export function ShopPwaInstall({ shopName, className, variant = "hero" }: Props) {
  const c = useShopPwaCopy();
  const [installEvent, setInstallEvent] = useState<
    (Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }) | null
  >(null);
  const [guideOpen, setGuideOpen] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (isShopPwaStandalone()) {
      setHidden(true);
      return;
    }
    const existing = getShopInstallPrompt();
    if (existing) setInstallEvent(existing);
    return listenForPwaInstallPrompt((event) => setInstallEvent(event));
  }, []);

  if (hidden) return null;

  async function onInstallClick() {
    if (installEvent) {
      const accepted = await triggerPwaInstallPrompt(installEvent);
      if (accepted) setHidden(true);
      setInstallEvent(null);
      return;
    }
    setGuideOpen(true);
  }

  const label = c.installButton.replace("{shop}", shopName.trim() || c.defaultShopName);

  if (variant === "bar") {
    return (
      <>
        <Button
          type="button"
          variant="outline"
          className={cn("min-h-11 font-semibold border-blue-200 text-blue-900 bg-white", className)}
          onClick={() => void onInstallClick()}
        >
          <Smartphone size={16} className="mr-2" />
          {c.installShort}
        </Button>
        <InstallGuideDialog open={guideOpen} onOpenChange={setGuideOpen} shopName={shopName} ios={isIosSafari()} />
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => void onInstallClick()}
        className={cn(
          "inline-flex items-center justify-center gap-2 min-h-11 px-5 rounded-full",
          "bg-white/15 hover:bg-white/25 border border-white/30 text-white font-semibold text-sm backdrop-blur transition-colors",
          className,
        )}
      >
        <Download size={16} aria-hidden />
        {label}
      </button>
      <InstallGuideDialog open={guideOpen} onOpenChange={setGuideOpen} shopName={shopName} ios={isIosSafari()} />
    </>
  );
}

function InstallGuideDialog({
  open,
  onOpenChange,
  shopName,
  ios,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shopName: string;
  ios: boolean;
}) {
  const c = useShopPwaCopy();
  const name = shopName.trim() || c.defaultShopName;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{c.guideTitle.replace("{shop}", name)}</DialogTitle>
          <DialogDescription>{c.guideSubtitle}</DialogDescription>
        </DialogHeader>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 leading-relaxed">
          {ios ? (
            <>
              <li>{c.iosStep1}</li>
              <li>{c.iosStep2}</li>
              <li>{c.iosStep3.replace("{shop}", name)}</li>
            </>
          ) : (
            <>
              <li>{c.androidStep1}</li>
              <li>{c.androidStep2.replace("{shop}", name)}</li>
              <li>{c.androidStep3}</li>
            </>
          )}
        </ol>
        <p className="text-xs text-gray-500 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2">
          {c.guideNote}
        </p>
        <Button
          type="button"
          className="w-full min-h-11 text-white"
          style={{ backgroundColor: BRAND_BLUE }}
          onClick={() => onOpenChange(false)}
        >
          {c.guideClose}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
