import { useState } from "react";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import { InfoEmailLine, LuxuryStaticShell } from "@/components/luxury-static-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useStaticPages } from "@/lib/static-pages-i18n";
import { BRAND_BLUE } from "@/lib/brand-colors";

const INFO_EMAIL = "info@ketujemi.com";
const SUPPORT_EMAIL = "support@ketujemi.com";

export default function ContactPage() {
  const { contact: c } = useStaticPages();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !subject || !message.trim()) {
      toast({ title: c.toastRequired, variant: "destructive" });
      return;
    }

    setBusy(true);
    try {
      const res = await fetchWithTimeout("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subject,
          message: message.trim(),
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        message?: string;
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.message ?? data.error ?? "send failed");
      }

      toast({ title: c.toastSuccess });
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (err) {
      const detail = err instanceof Error ? err.message : "";
      toast({
        title: detail && detail !== "send failed" ? detail : c.toastError,
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <LuxuryStaticShell title={c.title} tagline={c.tagline}>
      <div className="space-y-4 pb-2 border-b border-gray-100">
        <InfoEmailLine label={c.officialEmailLabel} email={INFO_EMAIL} />
        <InfoEmailLine label={c.technicalSupportLabel} email={SUPPORT_EMAIL} />
        {c.phoneLabel && c.phoneValue ? (
          <p className="text-sm sm:text-base">
            <span className="font-semibold text-gray-800">{c.phoneLabel}</span> {c.phoneValue}
          </p>
        ) : null}
        {c.addressLabel && c.addressValue ? (
          <p className="text-sm sm:text-base">
            <span className="font-semibold text-gray-800">{c.addressLabel}</span> {c.addressValue}
          </p>
        ) : null}
        <p className="text-sm sm:text-base">
          <span className="font-semibold text-gray-800">{c.hoursLabel}</span> {c.hoursValue}
        </p>
      </div>

      <div>
        <h2 className="text-base font-bold text-gray-900 mb-4">{c.formTitle}</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contact-name">
              {c.nameLabel} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="contact-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="min-h-12 h-12 text-base"
              autoComplete="name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-email">
              {c.emailFieldLabel} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="contact-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="min-h-12 h-12 text-base"
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-subject">
              {c.subjectLabel} <span className="text-red-500">*</span>
            </Label>
            <Select value={subject} onValueChange={setSubject} required>
              <SelectTrigger id="contact-subject" className="min-h-12 h-12 text-base">
                <SelectValue placeholder={c.subjectPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {c.subjects.map((s) => (
                  <SelectItem key={s.value} value={s.value} className="min-h-11">
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-message">
              {c.messageLabel} <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="contact-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={5}
              className="min-h-[8rem] text-base resize-y"
            />
          </div>
          <Button
            type="submit"
            className="w-full min-h-12 h-12 text-base font-semibold text-white"
            style={{ backgroundColor: BRAND_BLUE }}
            disabled={busy}
          >
            {busy ? "…" : c.submitBtn}
          </Button>
          {c.formNote ? (
            <p className="text-sm text-gray-600 leading-relaxed">{c.formNote}</p>
          ) : null}
        </form>
      </div>
    </LuxuryStaticShell>
  );
}
