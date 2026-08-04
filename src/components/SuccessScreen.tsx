import { motion } from "framer-motion";
import { CheckCircle, PartyPopper, ArrowRight, Calendar, Phone, Copy, Check, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormData } from "./LoanApplicationForm";
import confetti from "canvas-confetti";
import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface SuccessScreenProps {
  formData: FormData;
  onClose: () => void;
}

const SuccessScreen = ({ formData, onClose }: SuccessScreenProps) => {
  const { toast } = useToast();
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentStage, setPaymentStage] = useState<"form" | "success">("form");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const [checkoutId, setCheckoutId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "initiated" | "pending" | "paid" | "failed">("idle");
  const [trackingNumber, setTrackingNumber] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const supportPhone = "0105575260";
  const whatsappNumber = "254105575260";

  const copyPhoneNumber = async () => {
    try {
      await navigator.clipboard.writeText(supportPhone);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        variant: "destructive",
        title: "Copy failed",
        description: "Could not copy phone number to clipboard.",
      });
    }
  };

  const processingFee = 129;

  const loanTypeLabels: Record<string, string> = {
    business: "Business Loan",
    personal: "Personal Loan",
    emergency: "Emergency Loan",
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const referenceNumber = useMemo(() => {
    return `NYT${Date.now().toString().slice(-6)}`;
  }, []);

  const whatsappHref = useMemo(() => {
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
      `Hello NYOTA, I have an inquiry. My reference number is ${referenceNumber}.`
    )}`;
  }, [referenceNumber]);

  const isPhoneValid = useMemo(() => {
    const cleaned = phoneNumber.replace(/\D/g, "");
    if (/^0(7\d{8}|1\d{8})$/.test(cleaned)) return true;
    if (/^254(7\d{8}|1\d{8})$/.test(cleaned)) return true;
    if (/^(7\d{8}|1\d{8})$/.test(cleaned)) return true;
    return false;
  }, [phoneNumber]);

  const initiateStkPush = async () => {
    const res = await fetch(`/api/payhero/initiate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone: phoneNumber,
        amount: processingFee,
        reference: referenceNumber,
        referencePrefix: "NYOTA",
        description: "Application processing fee",
      }),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok || !data) {
      const apiMessage =
        (typeof data?.message === "string" ? data.message : null) ??
        (typeof data?.error === "string" ? data.error : null);
      return {
        success: false as const,
        message: apiMessage ?? `Payment initiation failed (${res.status})`,
        raw: data,
      };
    }

    const checkoutId =
      data?.checkoutId ??
      data?.checkoutRequestId ??
      data?.payheroReference ??
      data?.checkout_id ??
      null;

    const statusText = String(data?.status ?? data?.raw?.status ?? "").toLowerCase();

    return {
      success:
        data?.success === true ||
        statusText === "success" ||
        statusText === "queued" ||
        statusText === "pending" ||
        Boolean(checkoutId),
      checkoutId,
      message: data?.message,
      raw: data,
    };
  };

  const checkPaymentStatus = async (activeCheckoutId: string) => {
    const res = await fetch(`/api/payhero/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ checkoutId: activeCheckoutId }),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok || !data) {
      return { status: "error" as const, message: "Status check failed", raw: data };
    }

    const state = String(data?.state ?? "").toLowerCase();
    const statusText = String(data?.status ?? "").toLowerCase();
    const paid =
      data?.success === true ||
      state === "success" ||
      statusText === "success" ||
      statusText === "paid" ||
      statusText === "completed";
    const failed =
      state === "failed" ||
      statusText === "failed" ||
      statusText === "cancelled" ||
      statusText === "canceled";

    return {
      status: paid ? ("paid" as const) : failed ? ("failed" as const) : ("pending" as const),
      message: data?.resultDesc ?? data?.message,
      trackingNumber: typeof data?.trackingNumber === "string" ? data.trackingNumber : null,
      receiptNumber: typeof data?.receiptNumber === "string" ? data.receiptNumber : null,
      raw: data,
    };
  };

  const handleRequestPayment = async () => {
    if (!isPhoneValid) {
      toast({
        variant: "destructive",
        title: "Enter a valid phone number",
        description: "Use your M-Pesa phone number (e.g. 07XXXXXXXX)",
      });
      return;
    }

    setIsPaying(true);

    const pollForConfirmation = async (activeCheckoutId: string) => {
      setPaymentStatus("pending");

      for (let attempt = 0; attempt < 12; attempt++) {
        await new Promise((r) => window.setTimeout(r, 5000));

        const status = await checkPaymentStatus(activeCheckoutId);

        if (status.status === "paid") {
          setPaymentStatus("paid");
          const newTrackingNumber =
            status.trackingNumber ??
            `NYOTA-TRK-${String(activeCheckoutId).replace(/[^a-zA-Z0-9]/g, "").slice(-8).toUpperCase()}`;
          setTrackingNumber(newTrackingNumber);
          setPaymentStage("success");
          toast({
            title: "Application successful",
            description: (
              <div className="space-y-2">
                <p>
                  Your disbursement has been queued. You will receive confirmation message within 24hrs. In case of
                  delays, WhatsApp us on:
                </p>
                <div className="flex items-center gap-2 bg-muted p-2 rounded">
                  <span className="font-semibold">{supportPhone}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={copyPhoneNumber}
                  >
                    {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            ),
            duration: 7000,
          });
          return;
        }

        if (status.status === "failed") {
          setPaymentStatus("failed");
          toast({
            variant: "destructive",
            title: "Payment not completed",
            description: status.message ?? "You can try again.",
          });
          return;
        }
      }

      toast({
        title: "Waiting for payment",
        description: "If you completed payment, tap Finish Application again to re-check status.",
      });
    };

    try {
      if (checkoutId && !trackingNumber) {
        toast({
          title: "Re-checking payment status",
          description: "Please wait while we confirm your payment.",
        });
        await pollForConfirmation(checkoutId);
        return;
      }

      setPaymentStatus("initiated");
      const init = await initiateStkPush();

      if (!init?.success || !init.checkoutId) {
        setPaymentStatus("failed");
        toast({
          variant: "destructive",
          title: "Could not initiate payment",
          description: init?.message ?? "Please try again.",
        });
        return;
      }

      setCheckoutId(init.checkoutId);
      toast({
        title: "STK prompt sent",
        description: "Check your phone and enter your M-Pesa PIN to complete payment.",
      });

      await pollForConfirmation(init.checkoutId);
    } finally {
      setIsPaying(false);
    }
  };

  useEffect(() => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#2E9A4E", "#F97316", "#FFB800"],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#2E9A4E", "#F97316", "#FFB800"],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, []);

  // Hide the global floating WhatsApp button while this success screen is visible.
  useEffect(() => {
    document.documentElement.classList.add("hide-whatsapp-floating");
    return () => document.documentElement.classList.remove("hide-whatsapp-floating");
  }, []);

  // Keep the final success screen visible for 8 minutes, then close automatically.
  useEffect(() => {
    if (!trackingNumber) return;
    const timeout = window.setTimeout(() => onClose(), 8 * 60 * 1000);
    return () => window.clearTimeout(timeout);
  }, [trackingNumber, onClose]);

  return (
    <div className="p-4 sm:p-6 md:p-8 text-center">
      {/* Success Icon */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto mb-4 md:mb-6"
      >
        <div className="absolute inset-0 rounded-full bg-gradient-success opacity-20 animate-pulse" />
        <div className="absolute inset-2 rounded-full bg-gradient-success flex items-center justify-center shadow-glow">
          <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-primary-foreground" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-center gap-1 sm:gap-2 mb-2">
          <PartyPopper className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-secondary" />
          <h2 className="font-display text-lg sm:text-xl md:text-2xl font-bold text-foreground">
            Congratulations!
          </h2>
          <PartyPopper className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-secondary transform scale-x-[-1]" />
        </div>
        <p className="text-base md:text-lg text-primary font-semibold mb-1 md:mb-2">
          You Have Qualified!
        </p>
        <p className="text-muted-foreground text-sm mb-4 md:mb-6">
          Your loan application has been approved
        </p>
      </motion.div>

      {/* Loan Details Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-hero rounded-xl md:rounded-2xl p-4 md:p-6 text-primary-foreground mb-4 md:mb-6 shadow-glow"
      >
        <p className="text-xs md:text-sm opacity-80 mb-1">Approved Loan Amount</p>
        <p className="font-display text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4">
          {formatCurrency(formData.loanAmount)}
        </p>
        <div className="flex justify-center gap-4 md:gap-6 text-xs md:text-sm">
          <div>
            <p className="opacity-70">Loan Type</p>
            <p className="font-semibold">{loanTypeLabels[formData.loanType]}</p>
          </div>
          <div className="border-l border-primary-foreground/30 pl-4 md:pl-6">
            <p className="opacity-70">Reference</p>
            <p className="font-semibold">{referenceNumber}</p>
          </div>
        </div>
      </motion.div>

      {trackingNumber && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="text-left bg-muted/50 rounded-lg md:rounded-xl p-3 md:p-4 mb-4 md:mb-6"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs text-muted-foreground">In case of inquiries, WhatsApp us on</div>
              <div className="mt-1 flex items-center gap-2">
                <span className="font-semibold text-foreground">{supportPhone}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={copyPhoneNumber}
                  aria-label="Copy WhatsApp number"
                >
                  {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#25D366] px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              WhatsApp
            </a>
          </div>
          <div className="mt-2 text-[11px] text-muted-foreground">
            Tip: Your reference number is <span className="font-medium text-foreground">{referenceNumber}</span>.
          </div>
        </motion.div>
      )}

      {trackingNumber && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-left bg-muted/50 rounded-lg md:rounded-xl p-3 md:p-4 mb-4 md:mb-6"
        >
          <h3 className="font-semibold text-foreground text-sm md:text-base mb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            Disbursement tracking number
          </h3>
          <div className="rounded-lg border border-border bg-background p-3">
            <div className="text-[11px] text-muted-foreground">Tracking number</div>
            <div className="font-display text-lg font-bold text-foreground">{trackingNumber}</div>
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">
            This screen will close automatically in 8 minutes.
          </p>
        </motion.div>
      )}

      {/* Next Steps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="text-left bg-muted/50 rounded-lg md:rounded-xl p-3 md:p-4 mb-4 md:mb-6"
      >
        <h3 className="font-semibold text-foreground text-sm md:text-base mb-2 md:mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          What happens next?
        </h3>
        <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm text-muted-foreground">
          {!trackingNumber ? (
            <>
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] md:text-xs font-bold flex-shrink-0">1</span>
                <span>Tap <span className="font-medium text-foreground">Finish Application</span> to generate your disbursement tracking number</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] md:text-xs font-bold flex-shrink-0">2</span>
                <span>Complete the Ksh {processingFee} processing fee (M-Pesa prompt will be sent to your phone)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] md:text-xs font-bold flex-shrink-0">3</span>
                <span>Use your tracking number for follow-ups as funds are processed for disbursement</span>
              </li>
            </>
          ) : (
            <>
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] md:text-xs font-bold flex-shrink-0">1</span>
                <span>Keep your tracking number for follow-ups and support</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] md:text-xs font-bold flex-shrink-0">2</span>
                <span>Funds are processed for disbursement to your M-Pesa</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] md:text-xs font-bold flex-shrink-0">3</span>
                <span>A NYOTA representative may contact you if verification is required</span>
              </li>
            </>
          )}
        </ul>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="flex flex-col sm:flex-row gap-2 md:gap-3"
      >
        <Dialog
          open={isPaymentDialogOpen}
          onOpenChange={(open) => {
            setIsPaymentDialogOpen(open);
            if (open) {
              setPaymentStage(trackingNumber ? "success" : "form");
            }
          }}
        >
          <Button
            variant="success"
            className="flex-1 text-sm md:text-base"
            onClick={() => {
              setPaymentStage(trackingNumber ? "success" : "form");
              setIsPaymentDialogOpen(true);
            }}
          >
            {trackingNumber ? "View Tracking" : "Finish Application"}
            <ArrowRight className="w-4 h-4" />
          </Button>

          <DialogContent className="sm:max-w-md">
            {paymentStage === "form" ? (
              <>
                <DialogHeader>
                  <DialogTitle>Finish application</DialogTitle>
                  <DialogDescription>
                    A processing fee of Ksh {processingFee} is required to generate your disbursement tracking number.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground" htmlFor="mpesaPhone">
                    M-Pesa Phone Number
                  </label>
                  <Input
                    id="mpesaPhone"
                    variant="form"
                    inputSize="lg"
                    placeholder="07XXXXXXXX"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 12))}
                  />
                  <p className="text-[11px] text-muted-foreground">You’ll receive an M-Pesa prompt on your phone to complete the payment.</p>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsPaymentDialogOpen(false)}
                    disabled={isPaying}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="success"
                    onClick={handleRequestPayment}
                    disabled={isPaying}
                  >
                    <Phone className="w-4 h-4" />
                    {isPaying
                      ? paymentStatus === "pending"
                        ? "Checking payment..."
                        : "Sending request..."
                      : "Finish Application"}
                  </Button>
                </DialogFooter>
              </>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle>Tracking number generated</DialogTitle>
                  <DialogDescription>
                    Use this number for follow-ups on fund disbursement.
                  </DialogDescription>
                </DialogHeader>

                {trackingNumber && (
                  <div className="rounded-lg border border-border bg-muted/30 p-3">
                    <div className="text-[11px] text-muted-foreground">Tracking number</div>
                    <div className="font-display text-lg font-bold text-foreground">{trackingNumber}</div>
                  </div>
                )}

                <DialogFooter>
                  <Button variant="success" onClick={() => setIsPaymentDialogOpen(false)}>
                    Done
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        <Button
          variant="outline"
          className="flex-1 text-sm md:text-base"
          onClick={onClose}
          disabled={isPaying}
        >
          Back to Home
          <ArrowRight className="w-4 h-4" />
        </Button>
      </motion.div>
    </div>
  );
};

export default SuccessScreen;
