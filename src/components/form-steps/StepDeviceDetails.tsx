import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FormData } from "../LoanApplicationForm";

interface StepDeviceDetailsProps {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
}

const usageDurationOptions = [
  { id: "0-12", label: "0-12 Months" },
  { id: "1-3", label: "1-3 Years" },
  { id: "3-5", label: "3-5 Years" },
  { id: "5+", label: "5+ Years" },
];

const StepDeviceDetails = ({ formData, updateFormData }: StepDeviceDetailsProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display text-lg font-bold text-foreground mb-2">
          Device Details
        </h3>
        <p className="text-muted-foreground text-sm">
          Tell us about your phone usage
        </p>
      </div>

      {/* Phone Usage Duration */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">How long have you been using this phone number?</Label>
        <div className="grid grid-cols-2 gap-2">
          {usageDurationOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => updateFormData({ phoneUsageDuration: option.id })}
              className={`p-3 rounded-lg border-2 text-sm transition-all ${
                formData.phoneUsageDuration === option.id
                  ? "border-primary bg-primary/5 font-medium"
                  : "border-border hover:border-primary/50"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Phone Ownership */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Do you own this phone?</Label>
        <RadioGroup
          value={formData.ownsPhone}
          onValueChange={(value) => updateFormData({ ownsPhone: value })}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes" id="owns-yes" />
            <Label htmlFor="owns-yes">Yes, I own it</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id="owns-no" />
            <Label htmlFor="owns-no">No, it's borrowed/shared</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Phone Condition */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Did you get this phone new or used?</Label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => updateFormData({ phoneCondition: "new" })}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              formData.phoneCondition === "new"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
          >
            <div className="font-medium text-foreground">New</div>
            <div className="text-xs text-muted-foreground mt-1">
              Bought brand new
            </div>
          </button>
          <button
            onClick={() => updateFormData({ phoneCondition: "used" })}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              formData.phoneCondition === "used"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
          >
            <div className="font-medium text-foreground">Used</div>
            <div className="text-xs text-muted-foreground mt-1">
              Second-hand purchase
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StepDeviceDetails;
