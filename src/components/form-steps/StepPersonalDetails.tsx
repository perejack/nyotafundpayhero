import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FormData } from "../LoanApplicationForm";

interface StepPersonalDetailsProps {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
}

const employmentOptions = [
  { id: "employed", label: "Have a job" },
  { id: "self-employed", label: "Self Employed" },
  { id: "student", label: "Student" },
  { id: "no-income", label: "No Income" },
];

const educationOptions = [
  { id: "none", label: "None" },
  { id: "primary", label: "Primary" },
  { id: "secondary", label: "Secondary" },
  { id: "college", label: "College/University" },
];

const referralOptions = [
  { id: "social-media", label: "Social Media" },
  { id: "playstore", label: "Searching online" },
  { id: "friend", label: "Friend/Family" },
  { id: "government", label: "Government Office" },
  { id: "other", label: "Other" },
];

const StepPersonalDetails = ({ formData, updateFormData }: StepPersonalDetailsProps) => {
  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h3 className="font-display text-base md:text-lg font-bold text-foreground mb-1 md:mb-2">
          Personal Details
        </h3>
        <p className="text-muted-foreground text-xs md:text-sm">
          Tell us about yourself
        </p>
      </div>

      {/* Full Name */}
      <div className="space-y-1.5 md:space-y-2">
        <Label htmlFor="fullName" className="text-xs md:text-sm font-medium">Full Name</Label>
        <Input
          id="fullName"
          variant="form"
          inputSize="lg"
          placeholder="Enter your full name"
          value={formData.fullName}
          onChange={(e) => updateFormData({ fullName: e.target.value })}
          className="h-10 md:h-12 text-sm md:text-base"
        />
      </div>

      {/* Date of Birth & Gender */}
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        <div className="space-y-1.5 md:space-y-2">
          <Label htmlFor="dateOfBirth" className="text-xs md:text-sm font-medium">Date of Birth</Label>
          <Input
            id="dateOfBirth"
            type="date"
            variant="form"
            inputSize="lg"
            value={formData.dateOfBirth}
            onChange={(e) => updateFormData({ dateOfBirth: e.target.value })}
            className="h-10 md:h-12 text-sm md:text-base"
          />
        </div>
        <div className="space-y-1.5 md:space-y-2">
          <Label className="text-xs md:text-sm font-medium">Gender</Label>
          <Select
            value={formData.gender}
            onValueChange={(value) => updateFormData({ gender: value })}
          >
            <SelectTrigger className="h-10 md:h-12 text-sm md:text-base">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Employment Status */}
      <div className="space-y-2 md:space-y-3">
        <Label className="text-xs md:text-sm font-medium">Employment Status</Label>
        <div className="grid grid-cols-2 gap-2">
          {employmentOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => updateFormData({ employmentStatus: option.id })}
              className={`p-2.5 md:p-3 rounded-lg border-2 text-xs md:text-sm transition-all ${
                formData.employmentStatus === option.id
                  ? "border-primary bg-primary/5 font-medium"
                  : "border-border hover:border-primary/50"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Education Level */}
      <div className="space-y-2 md:space-y-3">
        <Label className="text-xs md:text-sm font-medium">Education Level</Label>
        <div className="grid grid-cols-2 gap-2">
          {educationOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => updateFormData({ educationLevel: option.id })}
              className={`p-2.5 md:p-3 rounded-lg border-2 text-xs md:text-sm transition-all ${
                formData.educationLevel === option.id
                  ? "border-primary bg-primary/5 font-medium"
                  : "border-border hover:border-primary/50"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Outstanding Loan */}
      <div className="space-y-2 md:space-y-3">
        <Label className="text-xs md:text-sm font-medium">Do you have any outstanding loan?</Label>
        <RadioGroup
          value={formData.hasOutstandingLoan}
          onValueChange={(value) => updateFormData({ hasOutstandingLoan: value })}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes" id="loan-yes" />
            <Label htmlFor="loan-yes" className="text-sm">Yes</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id="loan-no" />
            <Label htmlFor="loan-no" className="text-sm">No</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Referral Source */}
      <div className="space-y-1.5 md:space-y-2">
        <Label className="text-xs md:text-sm font-medium">Where did you hear about us?</Label>
        <Select
          value={formData.referralSource}
          onValueChange={(value) => updateFormData({ referralSource: value })}
        >
          <SelectTrigger className="h-10 md:h-12 text-sm md:text-base">
            <SelectValue placeholder="Select source" />
          </SelectTrigger>
          <SelectContent>
            {referralOptions.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default StepPersonalDetails;
