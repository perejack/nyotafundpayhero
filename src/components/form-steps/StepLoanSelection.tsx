import { motion } from "framer-motion";
import { Briefcase, User, AlertCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { FormData } from "../LoanApplicationForm";

interface StepLoanSelectionProps {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
}

const loanTypes = [
  {
    id: "business",
    title: "Business Loan",
    description: "For starting or growing your business",
    maxAmount: 200000,
    icon: Briefcase,
    color: "bg-gradient-hero",
  },
  {
    id: "personal",
    title: "Personal Loan",
    description: "For personal expenses and goals",
    maxAmount: 50000,
    icon: User,
    color: "bg-gradient-cta",
  },
  {
    id: "emergency",
    title: "Emergency Loan",
    description: "Quick support during emergencies",
    maxAmount: 20000,
    icon: AlertCircle,
    color: "from-accent to-nyota-green-light bg-gradient-to-r",
  },
];

const StepLoanSelection = ({ formData, updateFormData }: StepLoanSelectionProps) => {
  const selectedLoan = loanTypes.find((l) => l.id === formData.loanType);
  const maxAmount = selectedLoan?.maxAmount || 0;
  const MIN_AMOUNT = 5000;
  const STEP = 5000;

  const clampToRange = (value: number) => {
    const min = MIN_AMOUNT;
    const max = maxAmount || MIN_AMOUNT;
    return Math.min(max, Math.max(min, value));
  };

  const snapToStep = (value: number) => {
    return Math.round(value / STEP) * STEP;
  };

  const handleLoanTypeSelect = (type: string) => {
    const loan = loanTypes.find((l) => l.id === type);
    const defaultAmount = loan ? clampToRange(snapToStep(loan.maxAmount / 2)) : 0;
    updateFormData({
      loanType: type,
      loanAmount: defaultAmount,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const presetAmounts = (() => {
    if (!maxAmount) return [];

    const candidates = [
      MIN_AMOUNT,
      snapToStep(maxAmount * 0.25),
      snapToStep(maxAmount * 0.5),
      snapToStep(maxAmount * 0.75),
      maxAmount,
    ].map((v) => clampToRange(v));

    const unique = Array.from(new Set(candidates)).filter((v) => v <= maxAmount);
    unique.sort((a, b) => a - b);
    return unique;
  })();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display text-lg font-bold text-foreground mb-2">
          Select Loan Type
        </h3>
        <p className="text-muted-foreground text-sm">
          Choose the loan type that best fits your needs
        </p>
      </div>

      {/* Loan Type Cards */}
      <div className="grid gap-4">
        {loanTypes.map((loan) => (
          <motion.button
            key={loan.id}
            onClick={() => handleLoanTypeSelect(loan.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
              formData.loanType === loan.id
                ? "border-primary bg-primary/5 shadow-md"
                : "border-border hover:border-primary/50 hover:bg-muted/50"
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-xl ${loan.color} flex items-center justify-center shadow-md`}
              >
                <loan.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-foreground">{loan.title}</h4>
                <p className="text-sm text-muted-foreground">{loan.description}</p>
              </div>
              <div className="text-right">
                <span className="text-sm text-muted-foreground">Up to</span>
                <p className="font-bold text-primary">{formatCurrency(loan.maxAmount)}</p>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Amount Slider */}
      {formData.loanType && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 pt-4 border-t border-border"
        >
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-base font-semibold">Loan Amount</Label>
              <span className="text-2xl font-display font-bold text-primary">
                {formatCurrency(formData.loanAmount)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Type an amount or tap a quick option. You can also fine-tune with the slider.
            </p>
          </div>

          {/* Amount input */}
          <div className="grid gap-2">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                Ksh
              </span>
              <Input
                type="number"
                variant="form"
                inputSize="lg"
                min={MIN_AMOUNT}
                max={maxAmount}
                step={STEP}
                className="pl-12"
                value={formData.loanAmount ? String(formData.loanAmount) : ""}
                onChange={(e) => {
                  const raw = e.target.value;
                  if (!raw) {
                    updateFormData({ loanAmount: 0 });
                    return;
                  }
                  const parsed = Number(raw);
                  if (Number.isNaN(parsed)) return;
                  updateFormData({ loanAmount: clampToRange(snapToStep(parsed)) });
                }}
              />
            </div>

            {/* Presets */}
            {presetAmounts.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {presetAmounts.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => updateFormData({ loanAmount: amount })}
                    className={`px-3 py-2 rounded-lg border text-xs transition-all ${
                      formData.loanAmount === amount
                        ? "border-primary bg-primary/5 text-primary font-medium"
                        : "border-border hover:border-primary/50 text-muted-foreground"
                    }`}
                  >
                    {new Intl.NumberFormat("en-KE", { maximumFractionDigits: 0 }).format(amount)}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Slider
            value={[formData.loanAmount]}
            onValueChange={(value) => updateFormData({ loanAmount: clampToRange(value[0]) })}
            min={MIN_AMOUNT}
            max={maxAmount}
            step={STEP}
            className="py-4"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Ksh 5,000</span>
            <span>{formatCurrency(maxAmount)}</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default StepLoanSelection;
