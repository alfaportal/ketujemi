import { Link } from "wouter";
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMarket } from "@/lib/market-context";

export function CategoryPageLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-48 sm:h-56 bg-gray-200 animate-pulse" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function CategoryPageLoadError({ onRetry }: { onRetry: () => void }) {
  const { t } = useMarket();
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 space-y-4">
          <div className="flex gap-2 items-center">
            <AlertCircle className="h-8 w-8 text-red-500 shrink-0" />
            <h1 className="text-xl font-bold text-gray-900">{t.nf_title}</h1>
          </div>
          <p className="text-sm text-gray-600">{t.nf_body}</p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={onRetry}>
              <Loader2 className="mr-2 h-4 w-4" />
              Retry
            </Button>
            <Button type="button" asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                KetuJemi
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function CategoryPageNotFound() {
  const { t } = useMarket();
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 space-y-4">
          <div className="flex gap-2 items-center">
            <AlertCircle className="h-8 w-8 text-amber-500 shrink-0" />
            <h1 className="text-xl font-bold text-gray-900">{t.nf_title}</h1>
          </div>
          <p className="text-sm text-gray-600">{t.nf_body}</p>
          <Button type="button" asChild className="w-full sm:w-auto">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              KetuJemi
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
