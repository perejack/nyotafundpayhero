import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Shield, Phone, CreditCard } from "lucide-react";
import { FormData } from "../LoanApplicationForm";

interface StepIdentificationProps {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
}

const StepIdentification = ({ formData, updateFormData }: StepIdentificationProps) => {
  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "");
    // Limit to 12 digits (including country code)
    return digits.slice(0, 12);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display text-lg font-bold text-foreground mb-2">
          Identification Details
        </h3>
        <p className="text-muted-foreground text-sm">
          Provide your identification for verification
        </p>
      </div>

      {/* Security Notice */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
        <Shield className="w-5 h-5 text-primary mt-0.5" />
        <div>
          <p className="text-sm font-medium text-foreground">Your data is secure</p>
          <p className="text-xs text-muted-foreground">
            All information is encrypted and used only for loan processing
          </p>
        </div>
      </div>

      {/* Mobile Number */}
      <div className="space-y-2">
        <Label htmlFor="mobileNumber" className="text-sm font-medium flex items-center gap-2">
          <Phone className="w-4 h-4" />
          Mobile Number *
        </Label>
        <div className="relative">
          <Input
            id="mobileNumber"
            variant="form"
            inputSize="lg"
            placeholder="07XXXXXXXX"
            value={formData.mobileNumber}
            onChange={(e) =>
              updateFormData({ mobileNumber: formatPhoneNumber(e.target.value) })
            }
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Enter your M-Pesa registered number
        </p>
      </div>

      {/* National ID */}
      <div className="space-y-2">
        <Label htmlFor="nationalId" className="text-sm font-medium flex items-center gap-2">
          <CreditCard className="w-4 h-4" />
          National ID Number *
        </Label>
        <Input
          id="nationalId"
          variant="form"
          inputSize="lg"
          placeholder="Enter your National ID number"
          value={formData.nationalId}
          onChange={(e) =>
            updateFormData({ nationalId: e.target.value.replace(/\D/g, "").slice(0, 10) })
          }
        />
        <p className="text-xs text-muted-foreground">
          Your 8-digit National ID number
        </p>
      </div>

      {/* Terms Notice */}
      <div className="p-4 rounded-xl bg-muted border border-border">
        <p className="text-xs text-muted-foreground">
          By submitting this application, you agree to our{" "}
          <a href="#" className="text-primary hover:underline">Terms of Service</a>{" "}
          and{" "}
          <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
          You also authorize us to verify your information with relevant authorities.
        </p>
      </div>
    </div>
  );
};

export default StepIdentification;
