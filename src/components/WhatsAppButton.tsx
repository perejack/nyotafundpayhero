import { MessageCircle } from "lucide-react";

const WhatsAppButton = () => {
  const whatsappNumber = "254105575260";
  const whatsappUrl = `https://wa.me/${whatsappNumber}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 group animate-bounce-slow"
      style={{
        animation: "bounce 2s infinite",
      }}
    >
      <div className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-2xl">
        <MessageCircle className="w-6 h-6" />
        <span className="font-semibold whitespace-nowrap">Talk to us</span>
      </div>
      <style>{`
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </a>
  );
};

export default WhatsAppButton;
