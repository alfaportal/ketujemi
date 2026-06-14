import { useCallback, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import { useAuth } from "@/lib/auth-context";
import { useMarket } from "@/lib/market-context";
import { engagementCopyForUiLang } from "@/lib/engagement-i18n";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export type UserNotificationRow = {
  id: number;
  type: string;
  payload: {
    listingId?: number;
    listingTitle?: string;
    removedCount?: number;
    maxPhotos?: number;
  };
  read_at: string | null;
  requires_action: boolean;
  created_at: string;
};

type NotificationsResponse = {
  notifications: UserNotificationRow[];
  unread_count: number;
};

async function fetchNotifications(): Promise<NotificationsResponse> {
  const res = await fetchWithTimeout("/api/notifications", { credentials: "include" });
  if (res.status === 401) return { notifications: [], unread_count: 0 };
  if (!res.ok) throw new Error("notifications_fetch_failed");
  return (await res.json()) as NotificationsResponse;
}

function notificationMessage(
  row: UserNotificationRow,
  copy: ReturnType<typeof engagementCopyForUiLang>,
): string {
  if (row.type === "listing_first_external_view") {
    return copy.listingFirstView(row.payload.listingTitle ?? "");
  }
  if (row.type === "listing_excess_photos_removed") {
    return copy.listingExcessPhotosRemoved(
      row.payload.listingTitle ?? "",
      row.payload.removedCount ?? 0,
      row.payload.maxPhotos ?? 10,
    );
  }
  if (row.type === "social_follow_prompt") {
    return [
      copy.socialFollowTitle,
      copy.socialFollowBody,
      copy.socialFollowFacebook,
      copy.socialFollowInstagram,
      copy.socialFollowTikTok,
      copy.socialFollowFooter,
    ].join("\n");
  }
  return "";
}

type Props = {
  className?: string;
  btnCls?: string;
};

export function NotificationBell({ className, btnCls = "" }: Props) {
  const { user } = useAuth();
  const { uiLang } = useMarket();
  const copy = engagementCopyForUiLang(uiLang);
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);

  const query = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    enabled: !!user,
    refetchInterval: 60_000,
    staleTime: 15_000,
  });

  const markRead = useCallback(
    async (ids: number[]) => {
      if (!ids.length) return;
      await fetchWithTimeout("/api/notifications/read", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ids }),
      });
      await queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    [queryClient],
  );

  useEffect(() => {
    if (!open || !query.data) return;
    const unreadIds = query.data.notifications
      .filter((n) => !n.read_at && !n.requires_action)
      .map((n) => n.id);
    if (unreadIds.length) void markRead(unreadIds);
  }, [open, query.data, markRead]);

  async function setSocialPreference(
    notificationId: number,
    preference: "opted_in" | "opted_out",
  ) {
    setBusyId(notificationId);
    try {
      await fetchWithTimeout("/api/notifications/social-follow-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ preference, notification_id: notificationId }),
      });
      await queryClient.invalidateQueries({ queryKey: ["notifications"] });
      await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    } finally {
      setBusyId(null);
    }
  }

  if (!user) return null;

  const unread = query.data?.unread_count ?? 0;
  const rows = query.data?.notifications ?? [];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className={`relative ${btnCls} ${className ?? ""}`}
          aria-label={copy.notificationsTitle}
          data-testid="button-notifications"
        >
          <Bell className="h-5 w-5" />
          {unread > 0 ? (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {unread > 9 ? "9+" : unread}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(calc(100vw-2rem),22rem)] p-0 md:w-80">
        <div className="border-b px-3 py-2 text-sm font-semibold">{copy.notificationsTitle}</div>
        <div className="max-h-80 overflow-y-auto">
          {rows.length === 0 ? (
            <p className="px-3 py-4 text-sm text-muted-foreground">{copy.notificationsEmpty}</p>
          ) : (
            rows.map((row) => (
              <div
                key={row.id}
                className={`border-b px-3 py-3 text-sm last:border-b-0 ${
                  row.read_at ? "opacity-80" : "bg-muted/30"
                }`}
              >
                <p className="whitespace-pre-line leading-snug">{notificationMessage(row, copy)}</p>
                {row.type === "social_follow_prompt" && row.requires_action ? (
                  <div className="mt-3 flex flex-col gap-2">
                    <Button
                      type="button"
                      size="sm"
                      className="w-full justify-start"
                      disabled={busyId === row.id}
                      onClick={() => void setSocialPreference(row.id, "opted_in")}
                    >
                      {copy.socialFollowOptIn}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="w-full justify-start"
                      disabled={busyId === row.id}
                      onClick={() => void setSocialPreference(row.id, "opted_out")}
                    >
                      {copy.socialFollowOptOut}
                    </Button>
                  </div>
                ) : null}
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
