import { MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = "254105575260";

/**
 * Floating WhatsApp “Talk to us” button.
 * Uses wa.me which works on both mobile WhatsApp and WhatsApp Web.
 */
export default function WhatsAppFloatingButton() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Talk to us"
  )}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Talk to us on WhatsApp"
      className="whatsapp-floating-button fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2"
    >
      <MessageCircle className="h-5 w-5" aria-hidden="true" />
      <span>Talk to us</span>
    </a>
  );
}
