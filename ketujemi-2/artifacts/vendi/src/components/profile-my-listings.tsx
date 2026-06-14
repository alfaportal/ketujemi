import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import { useMarket } from "@/lib/market-context";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  useDeleteListing,
  getGetListingsQueryKey,
  getGetRecentListingsQueryKey,
  getGetFeaturedListingsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { prefetchRoute } from "@/lib/route-prefetch";

type MineListing = {
  id: number;
  title: string;
  status: string;
  is_expired: boolean;
  listed_at: string;
};

type MineResponse = { listings: MineListing[] };

export function ProfileMyListings() {
  const { t } = useMarket();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [listings, setListings] = useState<MineListing[]>([]);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  function loadListings() {
    setLoading(true);
    setError(null);
    void fetchWithTimeout("/api/listings/mine", { credentials: "include" })
      .then(async (r) => {
        if (!r.ok) {
          const j = (await r.json().catch(() => ({}))) as { message?: string };
          throw new Error(j.message ?? t.toast_reqFail);
        }
        return r.json() as Promise<MineResponse>;
      })
      .then((data) => setListings(data.listings ?? []))
      .catch((e) => setError(e instanceof Error ? e.message : t.toast_reqFail))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadListings();
  }, []);

  const deleteMutation = useDeleteListing({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetListingsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetRecentListingsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetFeaturedListingsQueryKey() });
        toast({ title: t.deleteSuccess });
        setDeletingId(null);
        loadListings();
      },
      onError: (err: unknown) => {
        const msg =
          err &&
          typeof err === "object" &&
          "data" in err &&
          err.data &&
          typeof err.data === "object" &&
          "message" in err.data &&
          typeof (err.data as { message?: string }).message === "string"
            ? (err.data as { message: string }).message
            : t.deleteError;
        toast({ title: msg, variant: "destructive" });
        setDeletingId(null);
      },
    },
  });

  return (
    <section className="space-y-3 pt-4 border-t border-gray-100" aria-labelledby="profile-my-listings-title">
      <div>
        <h2 id="profile-my-listings-title" className="text-base font-bold text-gray-900">
          {t.profile_myListings_heading}
        </h2>
      </div>

      {loading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : listings.length === 0 ? (
        <p className="text-sm text-gray-500">{t.profile_myListings_empty}</p>
      ) : (
        <ul className="space-y-2">
          {listings.map((item) => (
            <li
              key={item.id}
              className="flex flex-col gap-2 rounded-xl border border-gray-100 bg-gray-50/80 px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <Link
                  href={`/listings/${item.id}`}
                  onMouseEnter={() => prefetchRoute(`/listings/${item.id}`)}
                  onFocus={() => prefetchRoute(`/listings/${item.id}`)}
                  className="font-semibold text-sm text-gray-900 hover:text-blue-700 line-clamp-2"
                >
                  {item.title}
                </Link>
                {item.is_expired ? (
                  <span className="mt-1 inline-block text-xs font-medium text-amber-700">
                    {t.profile_myListings_expired}
                  </span>
                ) : null}
              </div>
              <div className="flex shrink-0 gap-2">
                {!item.is_expired ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1 min-h-10"
                    onClick={() => setLocation(`/listings/${item.id}/edit`)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    {t.edit}
                  </Button>
                ) : null}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-1 min-h-10 text-red-600 border-red-200 hover:bg-red-50"
                      disabled={deletingId === item.id}
                    >
                      {deletingId === item.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                      {t.delete}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t.deleteTitle}</AlertDialogTitle>
                      <AlertDialogDescription>{t.deleteDesc}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-600 hover:bg-red-700"
                        onClick={() => {
                          setDeletingId(item.id);
                          deleteMutation.mutate({ id: item.id });
                        }}
                      >
                        {t.delete}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
