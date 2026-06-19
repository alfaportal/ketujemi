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
  header: { img: "h-14 w-14 sm:h-16 sm:w-16 md:h-[4.5rem] md:w-[4.5rem]" },
  compact: { img: "h-10 w-10 sm:h-12 sm:w-12" },
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
        width={72}
        height={72}
        className={cn(
          "rounded-2xl object-cover shadow-[0_4px_14px_rgba(26,63,168,0.50)]",
          s.img,
          mobileWide && size === "header" && "max-md:h-16 max-md:w-16",
        )}
        draggable={false}
      />
    </Link>
  );
}
