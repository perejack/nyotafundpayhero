import { motion } from "framer-motion";
import { CheckCircle, PartyPopper, ArrowRight, Calendar, Phone, Copy, Check } from "lucide-react";
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
  const [paymentStage, setPaymentStage] = useState<"form" | "processing" | "waiting" | "success">("form");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const [checkoutId, setCheckoutId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "initiated" | "pending" | "paid" | "failed">("idle");
  const [trackingNumber, setTrackingNumber] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const supportPhone = "0105575260";

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

  const processingFee = 190;

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

  const isPhoneValid = useMemo(() => {
    const cleaned = phoneNumber.replace(/\s+/g, "");
    return cleaned.length >= 10;
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
        description: "Application processing fee",
      }),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok || !data) {
      return { success: false as const, message: "Payment initiation failed", raw: data };
    }

    const checkoutId = data?.checkoutId ?? data?.checkout_id ?? null;

    return {
      success: Boolean(data?.success) || String(data?.status ?? "").toLowerCase() === "success",
      checkoutId,
      message: data?.message,
      raw: data,
    };
  };

  const handleConfirmPayment = () => {
    // User confirms they paid - generate tracking number
    if (checkoutId) {
      const newTrackingNumber = `NYOTA-TRK-${String(checkoutId).replace(/[^a-zA-Z0-9]/g, "").slice(-8).toUpperCase()}`;
      setTrackingNumber(newTrackingNumber);
      setPaymentStage("success");
      setPaymentStatus("paid");
      toast({
        title: "Application successful",
        description: (
          <div className="space-y-2">
            <p>Your disbursement has been queued. You will receive confirmation message within 24hrs. In case of delays, call or SMS us:</p>
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
    }
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

    try {
      if (checkoutId && !trackingNumber) {
        // Already sent STK, just show waiting screen
        setPaymentStage("waiting");
        setIsPaymentDialogOpen(true);
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
      setPaymentStage("processing");
      
      // Show processing loader for 20 seconds, then switch to waiting
      setTimeout(() => {
        setPaymentStage("waiting");
      }, 20000);
      
      toast({
        title: "STK prompt sent",
        description: "Check your phone and enter your M-Pesa PIN to complete payment.",
      });
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
            Demo mode: tracking number shown is generated locally. In production this should come from the payment confirmation response.
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
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  />
                  <p className="text-[11px] text-muted-foreground">You'll receive an M-Pesa prompt on your phone to complete the payment.</p>
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
                    disabled={isPaying || !isPhoneValid}
                  >
                    <Phone className="w-4 h-4" />
                    {isPaying ? "Sending..." : "Send M-Pesa Prompt"}
                  </Button>
                </DialogFooter>
              </>
            ) : paymentStage === "processing" ? (
              <>
                <DialogHeader>
                  <DialogTitle>Check your phone</DialogTitle>
                  <DialogDescription>
                    M-Pesa STK prompt has been sent to {phoneNumber}. Enter your PIN to complete the Ksh {processingFee} payment.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-8">
                  <div className="flex items-center justify-center">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                      <Phone className="w-8 h-8 text-primary absolute inset-0 m-auto" />
                    </div>
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-sm font-medium text-foreground">
                      Waiting for M-Pesa confirmation...
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Please enter your M-Pesa PIN on your phone
                    </p>
                  </div>
                </div>
              </>
            ) : paymentStage === "waiting" ? (
              <>
                <DialogHeader>
                  <DialogTitle>Complete your payment</DialogTitle>
                  <DialogDescription>
                    M-Pesa STK prompt has been sent to {phoneNumber}. Enter your PIN to complete the Ksh {processingFee} payment.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                      <Phone className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                  <p className="text-center text-sm text-muted-foreground">
                    After entering your M-Pesa PIN, click the button below to generate your tracking number.
                  </p>
                </div>

                <DialogFooter className="flex flex-col gap-2">
                  <Button
                    variant="success"
                    onClick={handleConfirmPayment}
                    className="w-full"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    I've Completed Payment
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
