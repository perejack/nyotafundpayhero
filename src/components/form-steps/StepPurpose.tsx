import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormData } from "../LoanApplicationForm";

interface StepPurposeProps {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
}

const purposes = [
  { id: "business", label: "Business Expenses", description: "Inventory, equipment, expansion" },
  { id: "personal", label: "Personal Expenses", description: "Education, home, lifestyle" },
  { id: "emergency", label: "Emergency", description: "Medical, urgent repairs, family" },
  { id: "education", label: "Education & Training", description: "Courses, certifications, skills" },
];

const StepPurpose = ({ formData, updateFormData }: StepPurposeProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display text-lg font-bold text-foreground mb-2">
          Purpose of the Loan
        </h3>
        <p className="text-muted-foreground text-sm">
          Tell us how you plan to use this loan
        </p>
      </div>

      {/* Purpose Selection */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">What is the purpose of this loan?</Label>
        <div className="grid grid-cols-2 gap-3">
          {purposes.map((purpose) => (
            <button
              key={purpose.id}
              onClick={() => updateFormData({ purpose: purpose.id })}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                formData.purpose === purpose.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="font-medium text-foreground">{purpose.label}</div>
              <div className="text-xs text-muted-foreground mt-1">{purpose.description}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StepPurpose;
