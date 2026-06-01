import { useState } from "react";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";

const REASONS = [
  "Mashtrim / fake",
  "Produkt i falsifikuar",
  "Përmbajtje e papërshtatshme",
  "Spam / reklamë",
  "Informacion i rremë",
  "Tjetër",
] as const;

type Props = {
  listingId: number;
  className?: string;
};

export function ReportListingDialog({ listingId, className }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [detail, setDetail] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    const text = [reason, detail.trim()].filter(Boolean).join(" — ");
    if (text.length < 10) {
      toast({
        title: "Shkruani arsyen (min. 10 karaktere)",
        variant: "destructive",
      });
      return;
    }
    setBusy(true);
    try {
      const res = await fetchWithTimeout(`/api/listings/${listingId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          reason: text,
          reporter_name: name.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast({
          title: (data as { message?: string }).message ?? (data as { error?: string }).error ?? "Gabim",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: (data as { message?: string }).message ?? "Raportimi u dërgua.",
      });
      setOpen(false);
      setReason("");
      setDetail("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={className}
          data-testid="button-report-listing"
        >
          <Flag className="h-4 w-4 mr-2" aria-hidden />
          Raporto
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Raporto shpalljen</DialogTitle>
          <DialogDescription>
            Na tregoni problemin. Ekipi shqyrton raportimet brenda 24 orëve.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Arsyeja</Label>
            <select
              className="w-full min-h-12 rounded-xl border border-gray-200 px-3 text-sm"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >
              <option value="">Zgjidhni…</option>
              {REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Detaje (opsionale)</Label>
            <Textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              rows={3}
              placeholder="Përshkruani problemin…"
              className="text-[16px]"
            />
          </div>
          {!user ? (
            <div className="space-y-2">
              <Label>Emri juaj (opsional)</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="min-h-12" />
            </div>
          ) : null}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Anulo
          </Button>
          <Button type="button" onClick={() => void submit()} disabled={busy}>
            {busy ? "Duke dërguar…" : "Dërgo raportin"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
