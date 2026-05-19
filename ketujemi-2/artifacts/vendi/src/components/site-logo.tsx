import { Link } from "wouter";
import { cn } from "@/lib/utils";

const LOGO_SRC = `${import.meta.env.BASE_URL}logo.png`;

type Props = {
  className?: string;
  imageClassName?: string;
  testId?: string;
};

/** KetuJemi.com company logo — links to home. */
export function SiteLogo({ className, imageClassName, testId = "link-logo" }: Props) {
  return (
    <Link
      href="/"
      data-testid={testId}
      className={cn("inline-flex shrink-0 items-center select-none", className)}
      aria-label="KetuJemi.com"
    >
      <img
        src={LOGO_SRC}
        alt="KetuJemi.com"
        width={560}
        height={410}
        className={cn(
          "h-10 w-auto max-w-[min(280px,72vw)] object-contain drop-shadow-sm sm:h-12 md:h-[3.25rem]",
          imageClassName,
        )}
        decoding="async"
        fetchPriority="high"
      />
    </Link>
  );
}
