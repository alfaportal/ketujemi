import { Link } from "wouter";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  testId?: string;
};

/** Full KetuJemi.com wordmark — never truncated on mobile. */
export function SiteLogo({ className, testId = "link-logo" }: Props) {
  return (
    <Link
      href="/"
      data-testid={testId}
      className={cn(
        "inline-flex shrink-0 items-baseline whitespace-nowrap select-none",
        className,
      )}
    >
      <span className="text-sm font-black leading-none text-gray-900 sm:text-xl md:text-2xl">
        KetuJemi
      </span>
      <span className="text-sm font-black leading-none text-blue-500 sm:text-xl md:text-2xl">
        .com
      </span>
    </Link>
  );
}
