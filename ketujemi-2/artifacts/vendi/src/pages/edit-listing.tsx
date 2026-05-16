import { useRoute, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGetListing, useUpdateListing, useGetCategories, getGetListingQueryKey, getGetListingsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useMarket, LOCATIONS } from "@/lib/market-context";
import { useAuth, loginUrlWithReturn } from "@/lib/auth-context";
import { userOwnsListing } from "@/lib/listing-ownership";
import { AuthToolbar } from "@/components/auth-toolbar";

const schema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  price: z.coerce.number().min(0),
  location: z.string().min(1),
  condition: z.enum(["New", "Good", "Used"]),
  image_url: z.string().url().optional().or(z.literal("")),
  is_featured: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

export default function EditListing() {
  const [, params] = useRoute("/listings/:id/edit");
  const [, setLocation] = useLocation();
  const id = Number(params?.id);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t, market } = useMarket();
  const { user, loading: authLoading } = useAuth();

  const { data: listing, isLoading } = useGetListing(id, {
    query: {
      enabled: !!id,
      queryKey: [...getGetListingQueryKey(id), user?.id ?? "guest"],
    },
  });

  useEffect(() => {
    if (authLoading || isLoading || !listing) return;
    if (!user) {
      setLocation(loginUrlWithReturn(`/listings/${id}/edit`));
      return;
    }
    if (!userOwnsListing(user, listing)) {
      toast({ title: t.listingAccessDenied, variant: "destructive" });
      setLocation(`/listings/${id}`);
    }
  }, [authLoading, isLoading, user, listing, id, setLocation, toast, t.listingAccessDenied]);

  const form = useForm<FormData>({
    resolver: zodResolver(schema as never),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      location: "",
      condition: "Used",
      image_url: "",
      is_featured: false,
    },
  });

  useEffect(() => {
    if (listing) {
      form.reset({
        title: listing.title,
        description: listing.description,
        price: listing.price,
        location: listing.location,
        condition: listing.condition as "New" | "Good" | "Used",
        image_url: listing.image_url ?? "",
        is_featured: listing.is_featured,
      });
    }
  }, [listing]);

  const updateMutation = useUpdateListing({
    mutation: {
      onSuccess: (updated) => {
        queryClient.invalidateQueries({ queryKey: getGetListingsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetListingQueryKey(id) });
        toast({ title: t.updateSuccess });
        setLocation(`/listings/${updated.id}`);
      },
      onError: () => {
        toast({ title: t.updateError, variant: "destructive" });
      }
    }
  });

  const onSubmit = (data: FormData) => {
    updateMutation.mutate({
      id,
      data: {
        ...data,
        image_url: data.image_url || undefined,
      }
    });
  };

  const cityList = LOCATIONS[market.code] ?? LOCATIONS.ks;

  const canEdit = !!(user && listing && userOwnsListing(user, listing));

  if (authLoading || isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-[500px] w-full rounded-xl" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-xl font-semibold mb-2">{t.listingNotFound}</p>
        <Button onClick={() => setLocation("/listings")}>{t.backToListings}</Button>
      </div>
    );
  }

  if (!user || !canEdit) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button
        data-testid="button-back"
        onClick={() => setLocation(`/listings/${id}`)}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors rounded-lg min-h-12 px-1 -mx-1 touch-manipulation"
      >
        <ArrowLeft className="h-4 w-4" />
        {t.backToListing}
      </button>

      <div className="flex justify-end mb-4">
        <AuthToolbar variant="compact" />
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <h1 className="text-2xl font-bold mb-6">{t.editListingTitle}</h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.titleField}</FormLabel>
                  <FormControl>
                    <Input data-testid="input-title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.descField}</FormLabel>
                  <FormControl>
                    <Textarea data-testid="input-description" rows={4} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.priceEur}</FormLabel>
                    <FormControl>
                      <Input data-testid="input-price" type="number" min="0" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="condition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.conditionField}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-condition">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="New">{t.conditionNew}</SelectItem>
                        <SelectItem value="Good">{t.conditionGood}</SelectItem>
                        <SelectItem value="Used">{t.conditionUsed}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.cityField ?? t.locationSection}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-location">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {cityList.map((loc) => (
                        <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.imageUrlField}</FormLabel>
                  <FormControl>
                    <Input data-testid="input-image-url" placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_featured"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <FormLabel className="text-sm font-medium">{t.promoteLabel}</FormLabel>
                    <p className="text-xs text-muted-foreground mt-0.5">{t.promoteDesc}</p>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-featured" />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setLocation(`/listings/${id}`)}
                data-testid="button-cancel-edit"
              >
                {t.cancel}
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={updateMutation.isPending}
                data-testid="button-submit-edit"
              >
                {updateMutation.isPending ? t.saving : t.saveChanges}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
