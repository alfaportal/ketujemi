import { FaWhatsapp } from "react-icons/fa";

type Props = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
};

/** Butoni i regjistrimit/hyrjes me WhatsApp OTP (Meta Cloud API). */
export function WhatsAppOtpButton({ label, onClick, disabled }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex w-full min-h-12 items-center justify-center gap-2.5 rounded-md border border-[#25D366]/50 bg-[#25D366]/10 px-4 text-sm font-semibold text-[#075E54] hover:bg-[#25D366]/20 active:bg-[#25D366]/25 transition-colors disabled:opacity-50 disabled:pointer-events-none"
    >
      <FaWhatsapp className="h-6 w-6 shrink-0 text-[#25D366]" aria-hidden />
      {label}
    </button>
  );
}

export function WhatsAppIcon({ className }: { className?: string }) {
  return <FaWhatsapp className={className ?? "h-5 w-5 shrink-0 text-[#25D366]"} aria-hidden />;
}
