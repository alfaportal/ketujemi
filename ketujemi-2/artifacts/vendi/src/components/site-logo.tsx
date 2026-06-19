import { Link } from "wouter";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  testId?: string;
  /** header = nav (large); compact = footer */
  size?: "header" | "compact";
  /** Slightly wider pill on phone header row */
  mobileWide?: boolean;
};

const SIZE = {
  header: { img: "h-11 w-11 sm:h-12 sm:w-12 md:h-[3.25rem] md:w-[3.25rem]" },
  compact: { img: "h-9 w-9 sm:h-10 sm:w-10" },
} as const;

/** KetuJemi.com brand mark — app icon, matches TikTok / favicon exactly. */
export function SiteLogo({ className, testId = "link-logo", size = "header", mobileWide }: Props) {
  const s = SIZE[size];

  return (
    <Link
      href="/"
      data-testid={testId}
      className={cn(
        "inline-flex shrink-0 items-center select-none touch-manipulation",
        mobileWide && "max-md:w-full max-md:justify-center",
        className,
      )}
      aria-label="KetuJemi.com"
    >
      <img
        src="/logo.png"
        alt="KetuJemi.com"
        width={52}
        height={52}
        className={cn(
          "rounded-xl object-cover shadow-[0_3px_10px_rgba(26,63,168,0.45)]",
          s.img,
          mobileWide && size === "header" && "max-md:h-14 max-md:w-14",
        )}
        draggable={false}
      />
    </Link>
  );
}
