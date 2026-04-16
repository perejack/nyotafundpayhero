import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FormData } from "../LoanApplicationForm";

interface StepFinancialDetailsProps {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
}

const StepFinancialDetails = ({ formData, updateFormData }: StepFinancialDetailsProps) => {
  const formatCurrency = (value: string) => {
    const num = value.replace(/\D/g, "");
    return num ? parseInt(num) : 0;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display text-lg font-bold text-foreground mb-2">
          Financial Details
        </h3>
        <p className="text-muted-foreground text-sm">
          Tell us about your income and financial situation
        </p>
      </div>

      {/* Monthly Income */}
      <div className="space-y-2">
        <Label htmlFor="monthlyIncome" className="text-sm font-medium">
          How much do you earn monthly? (Ksh)
        </Label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
            Ksh
          </span>
          <Input
            id="monthlyIncome"
            variant="form"
            inputSize="lg"
            className="pl-14"
            placeholder="0"
            value={formData.monthlyIncome || ""}
            onChange={(e) =>
              updateFormData({ monthlyIncome: formatCurrency(e.target.value) })
            }
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Enter your average monthly earnings
        </p>
      </div>

      {/* Income Source */}
      <div className="space-y-2">
        <Label htmlFor="incomeSource" className="text-sm font-medium">
          Please describe shortly your main source of income
        </Label>
        <Textarea
          id="incomeSource"
          variant="form"
          placeholder="E.g., I work as a sales representative at a local company..."
          value={formData.incomeSource}
          onChange={(e) => updateFormData({ incomeSource: e.target.value })}
          className="min-h-[80px]"
        />
      </div>

      {/* Other Income */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Do you have any other source of income?</Label>
        <RadioGroup
          value={formData.hasOtherIncome}
          onValueChange={(value) => updateFormData({ hasOtherIncome: value })}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes" id="other-income-yes" />
            <Label htmlFor="other-income-yes">Yes</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id="other-income-no" />
            <Label htmlFor="other-income-no">No</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Income Type */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Do you always earn the same amount?</Label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => updateFormData({ incomeType: "fixed" })}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              formData.incomeType === "fixed"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
          >
            <div className="font-medium text-foreground">Fixed Income</div>
            <div className="text-xs text-muted-foreground mt-1">
              Same amount every month
            </div>
          </button>
          <button
            onClick={() => updateFormData({ incomeType: "variable" })}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              formData.incomeType === "variable"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
          >
            <div className="font-medium text-foreground">Variable Income</div>
            <div className="text-xs text-muted-foreground mt-1">
              Amount varies each month
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StepFinancialDetails;
