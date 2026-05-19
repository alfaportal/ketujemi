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
        width={220}
        height={56}
        className={cn("h-9 w-auto max-w-[min(220px,52vw)] object-contain sm:h-11 md:h-12", imageClassName)}
        decoding="async"
      />
    </Link>
  );
}
