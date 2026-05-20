import { useState } from "react";
import { StaticPageShell, Section } from "@/components/static-page-shell";
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
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subject,
          message: message.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error("send failed");
      }

      toast({ title: c.toastSuccess });
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch {
      toast({ title: c.toastError, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <StaticPageShell title={c.title} tagline={c.tagline}>
      <Section title={c.contactSectionTitle}>
        <ul className="space-y-3 text-sm sm:text-base">
          <li>
            <span className="mr-2" aria-hidden>
              📧
            </span>
            {c.officialEmailLabel}{" "}
            <a href={`mailto:${INFO_EMAIL}`} className="text-blue-600 font-semibold hover:underline">
              {INFO_EMAIL}
            </a>
          </li>
          <li>
            <span className="mr-2" aria-hidden>
              📧
            </span>
            {c.technicalSupportLabel}{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="text-blue-600 font-semibold hover:underline">
              {SUPPORT_EMAIL}
            </a>
          </li>
          <li>
            <span className="mr-2" aria-hidden>
              🕐
            </span>
            {c.hoursLabel} {c.hoursValue}
          </li>
          <li>
            <span className="mr-2" aria-hidden>
              📘
            </span>
            {c.facebookLabel}{" "}
            <a
              href="https://facebook.com/ketujemi"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 font-semibold hover:underline"
            >
              facebook.com/ketujemi
            </a>
          </li>
          <li>
            <span className="mr-2" aria-hidden>
              📸
            </span>
            {c.instagramLabel}{" "}
            <a
              href="https://instagram.com/ketujemi"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 font-semibold hover:underline"
            >
              instagram.com/ketujemi
            </a>
          </li>
        </ul>
      </Section>

      <section>
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">{c.formTitle}</h2>
        <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
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
          <Button type="submit" className="w-full min-h-12 h-12 text-base font-semibold" disabled={busy}>
            {busy ? "…" : c.submitBtn}
          </Button>
        </form>
      </section>

      <section>
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">{c.faqTitle}</h2>
        <div className="space-y-4">
          {c.faq.map((item) => (
            <div key={item.q} className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-2">{item.q}</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </section>
    </StaticPageShell>
  );
}
