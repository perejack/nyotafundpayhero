import { useEffect, useState, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Shield, Phone, CreditCard, FileText } from "lucide-react";
import { FormData } from "../LoanApplicationForm";
import { FileUpload } from "@/components/FileUpload";

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

  // Manage object URLs for file previews
  const [previewUrls, setPreviewUrls] = useState<{
    idFront: string | null;
    idBack: string | null;
    kraPin: string | null;
  }>({
    idFront: null,
    idBack: null,
    kraPin: null,
  });

  // Create and revoke object URLs properly
  useEffect(() => {
    const urls: string[] = [];

    if (formData.idFrontFile instanceof File) {
      const url = URL.createObjectURL(formData.idFrontFile);
      setPreviewUrls(prev => ({ ...prev, idFront: url }));
      urls.push(url);
    } else {
      setPreviewUrls(prev => ({ ...prev, idFront: null }));
    }

    if (formData.idBackFile instanceof File) {
      const url = URL.createObjectURL(formData.idBackFile);
      setPreviewUrls(prev => ({ ...prev, idBack: url }));
      urls.push(url);
    } else {
      setPreviewUrls(prev => ({ ...prev, idBack: null }));
    }

    if (formData.kraPinFile instanceof File) {
      const url = URL.createObjectURL(formData.kraPinFile);
      setPreviewUrls(prev => ({ ...prev, kraPin: url }));
      urls.push(url);
    } else {
      setPreviewUrls(prev => ({ ...prev, kraPin: null }));
    }

    // Cleanup function to revoke URLs when component unmounts or files change
    return () => {
      urls.forEach(url => {
        try {
          URL.revokeObjectURL(url);
        } catch {
          // Ignore errors during cleanup
        }
      });
    };
  }, [formData.idFrontFile, formData.idBackFile, formData.kraPinFile]);

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

      {/* Document Uploads Section */}
      <div className="border-t border-border pt-6 mt-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-primary" />
          <h4 className="font-display text-base font-semibold">Document Uploads</h4>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Please upload clear photos or scans of your documents. Accepted formats: JPG, PNG, PDF, HEIC, DOC, DOCX (Max 10MB each)
        </p>

        {/* ID Front Upload */}
        <FileUpload
          id="idFront"
          label="National ID - Front Side *"
          description="Upload front of your National ID"
          accept="image/*,.pdf,.doc,.docx,.heic,.heif"
          value={formData.idFrontFile}
          onChange={(file) => updateFormData({ idFrontFile: file })}
          previewUrl={previewUrls.idFront}
        />

        {/* ID Back Upload */}
        <div className="mt-4">
          <FileUpload
            id="idBack"
            label="National ID - Back Side *"
            description="Upload back of your National ID"
            accept="image/*,.pdf,.doc,.docx,.heic,.heif"
            value={formData.idBackFile}
            onChange={(file) => updateFormData({ idBackFile: file })}
            previewUrl={previewUrls.idBack}
          />
        </div>

        {/* KRA PIN Upload */}
        <div className="mt-4">
          <FileUpload
            id="kraPin"
            label="KRA PIN Certificate *"
            description="Upload your KRA PIN certificate"
            accept="image/*,.pdf,.doc,.docx,.heic,.heif"
            value={formData.kraPinFile}
            onChange={(file) => updateFormData({ kraPinFile: file })}
            previewUrl={previewUrls.kraPin}
          />
        </div>
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
