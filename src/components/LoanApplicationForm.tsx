import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import StepLoanSelection from "./form-steps/StepLoanSelection";
import StepPurpose from "./form-steps/StepPurpose";
import StepPersonalDetails from "./form-steps/StepPersonalDetails";
import StepFinancialDetails from "./form-steps/StepFinancialDetails";
import StepDeviceDetails from "./form-steps/StepDeviceDetails";
import StepIdentification from "./form-steps/StepIdentification";
import ProcessingScreen from "./ProcessingScreen";
import SuccessScreen from "./SuccessScreen";

export interface FormData {
  // Loan Selection
  loanType: string;
  loanAmount: number;
  
  // Purpose
  purpose: string;
  purposeDescription: string;
  
  // Personal Details
  fullName: string;
  dateOfBirth: string;
  gender: string;
  employmentStatus: string;
  educationLevel: string;
  hasOutstandingLoan: string;
  referralSource: string;
  
  // Financial Details
  monthlyIncome: number;
  incomeSource: string;
  hasOtherIncome: string;
  incomeType: string;
  
  // Device Details
  phoneUsageDuration: string;
  ownsPhone: string;
  phoneCondition: string;
  
  // Identification
  mobileNumber: string;
  nationalId: string;
}

const initialFormData: FormData = {
  loanType: "",
  loanAmount: 0,
  purpose: "",
  purposeDescription: "",
  fullName: "",
  dateOfBirth: "",
  gender: "",
  employmentStatus: "",
  educationLevel: "",
  hasOutstandingLoan: "",
  referralSource: "",
  monthlyIncome: 0,
  incomeSource: "",
  hasOtherIncome: "",
  incomeType: "",
  phoneUsageDuration: "",
  ownsPhone: "",
  phoneCondition: "",
  mobileNumber: "",
  nationalId: "",
};

interface LoanApplicationFormProps {
  variant?: "modal" | "page";
  isOpen?: boolean;
  onClose?: () => void;
}

const steps = [
  { id: 1, title: "Loan Type", shortTitle: "Loan" },
  { id: 2, title: "Purpose", shortTitle: "Purpose" },
  { id: 3, title: "Personal Details", shortTitle: "Personal" },
  { id: 4, title: "Financial Details", shortTitle: "Financial" },
  { id: 5, title: "Device Details", shortTitle: "Device" },
  { id: 6, title: "Identification", shortTitle: "ID" },
];

const DRAFT_STORAGE_KEY = "nyota_loan_application_draft_v1";

const LoanApplicationForm = ({ variant = "modal", isOpen, onClose }: LoanApplicationFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isExitConfirmOpen, setIsExitConfirmOpen] = useState(false);
  const contentScrollRef = useRef<HTMLDivElement | null>(null);
  const footerCtaRef = useRef<HTMLDivElement | null>(null);
  const didAutoScrollCtaRef = useRef(false);
  const didStepStartValidRef = useRef(false);

  const updateFormData = (data: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleNext = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    setIsProcessing(true);
  };

  const handleProcessingComplete = () => {
    setIsProcessing(false);
    setIsSuccess(true);
  };

  const handleClose = () => {
    setCurrentStep(1);
    setFormData(initialFormData);
    setIsProcessing(false);
    setIsSuccess(false);
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      // ignore
    }
    onClose?.();
  };

  const hasProgress =
    currentStep !== 1 ||
    isProcessing ||
    isSuccess ||
    JSON.stringify(formData) !== JSON.stringify(initialFormData);

  const requestClose = () => {
    if (variant === "page" && hasProgress) {
      setIsExitConfirmOpen(true);
      return;
    }
    handleClose();
  };

  useEffect(() => {
    if (variant !== "page") return;

    try {
      const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { currentStep?: number; formData?: FormData };
      if (parsed?.formData) {
        setFormData(parsed.formData);
      }
      if (typeof parsed?.currentStep === "number" && parsed.currentStep >= 1 && parsed.currentStep <= steps.length) {
        setCurrentStep(parsed.currentStep);
      }
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (variant !== "page") return;
    if (!hasProgress) return;

    const timeout = window.setTimeout(() => {
      try {
        localStorage.setItem(
          DRAFT_STORAGE_KEY,
          JSON.stringify({ currentStep, formData }),
        );
      } catch {
        // ignore
      }
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [variant, currentStep, formData, hasProgress]);

  useEffect(() => {
    contentScrollRef.current?.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [currentStep, isProcessing, isSuccess]);

  useEffect(() => {
    didAutoScrollCtaRef.current = false;
    didStepStartValidRef.current = isStepValid();
  }, [currentStep]);

  useEffect(() => {
    if (isProcessing || isSuccess) return;
    if (didAutoScrollCtaRef.current) return;
    if (didStepStartValidRef.current) return;
    if (!isStepValid()) return;

    didAutoScrollCtaRef.current = true;

    window.setTimeout(() => {
      footerCtaRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 50);
  }, [currentStep, formData, isProcessing, isSuccess]);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <StepLoanSelection formData={formData} updateFormData={updateFormData} />;
      case 2:
        return <StepPurpose formData={formData} updateFormData={updateFormData} />;
      case 3:
        return <StepPersonalDetails formData={formData} updateFormData={updateFormData} />;
      case 4:
        return <StepFinancialDetails formData={formData} updateFormData={updateFormData} />;
      case 5:
        return <StepDeviceDetails formData={formData} updateFormData={updateFormData} />;
      case 6:
        return <StepIdentification formData={formData} updateFormData={updateFormData} />;
      default:
        return null;
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return Boolean(formData.loanType) && formData.loanAmount > 0;
      case 2:
        return Boolean(formData.purpose);
      case 3:
        return [
          formData.fullName,
          formData.dateOfBirth,
          formData.gender,
          formData.employmentStatus,
          formData.educationLevel,
          formData.hasOutstandingLoan,
          formData.referralSource,
        ].every((v) => Boolean(v));
      case 4:
        return (
          formData.monthlyIncome > 0 &&
          Boolean(formData.incomeSource) &&
          Boolean(formData.hasOtherIncome) &&
          Boolean(formData.incomeType)
        );
      case 5:
        return (
          Boolean(formData.phoneUsageDuration) &&
          Boolean(formData.ownsPhone) &&
          Boolean(formData.phoneCondition)
        );
      case 6:
        return formData.mobileNumber.length >= 10 && formData.nationalId.length >= 6;
      default:
        return false;
    }
  };

  const getDisabledHint = () => {
    switch (currentStep) {
      case 1:
        if (!formData.loanType) return "Select a loan type to continue";
        if (!(formData.loanAmount > 0)) return "Choose a loan amount to continue";
        return "";
      case 2:
        if (!formData.purpose) return "Select a purpose to continue";
        return "";
      case 3:
        return "Complete all personal details to continue";
      case 4:
        return "Complete all financial details to continue";
      case 5:
        return "Complete all device details to continue";
      case 6:
        if (formData.mobileNumber.length < 10) return "Enter a valid mobile number";
        if (formData.nationalId.length < 6) return "Enter a valid national ID";
        return "";
      default:
        return "";
    }
  };

  if (variant === "modal" && !isOpen) return null;

  const cardClasses =
    variant === "page"
      ? "h-full flex flex-col overflow-hidden rounded-none sm:rounded-2xl"
      : "h-full flex flex-col overflow-hidden rounded-t-3xl sm:rounded-2xl";

  const content = (
    <Card variant="elevated" className={cardClasses}>
      {isSuccess ? (
        <SuccessScreen formData={formData} onClose={handleClose} />
      ) : isProcessing ? (
        <ProcessingScreen onComplete={handleProcessingComplete} />
      ) : (
        <>
          {/* Header */}
          <div className="shrink-0 p-4 sm:p-6 border-b border-border bg-muted/30">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="font-display text-lg sm:text-xl font-bold text-foreground">
                Loan Application
              </h2>
              <Button variant="ghost" size="icon" onClick={requestClose} className="h-8 w-8 sm:h-10 sm:w-10">
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-muted-foreground">
                  Step {currentStep} of {steps.length}
                </span>
                <span className="font-medium text-foreground">{steps[currentStep - 1].title}</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${(currentStep / steps.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Step Indicators - Compact for mobile */}
            <div className="flex justify-between mt-3 sm:mt-4 gap-1">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`flex flex-col items-center flex-1 ${
                    step.id <= currentStep ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (step.id < currentStep) {
                        setCurrentStep(step.id);
                      }
                    }}
                    disabled={step.id >= currentStep}
                    aria-label={`Go to step ${step.id}: ${step.title}`}
                    className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold transition-all ${
                      step.id < currentStep
                        ? "bg-primary text-primary-foreground"
                        : step.id === currentStep
                        ? "bg-primary text-primary-foreground ring-2 sm:ring-4 ring-primary/20"
                        : "bg-muted text-muted-foreground"
                    } ${step.id < currentStep ? "cursor-pointer" : "cursor-default"}`}
                  >
                    {step.id < currentStep ? <Check className="w-3 h-3 sm:w-4 sm:h-4" /> : step.id}
                  </button>
                  <span className="text-[9px] sm:text-xs mt-1 hidden xs:block">{step.shortTitle}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <div ref={contentScrollRef} className="flex-1 p-4 sm:p-6 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div ref={footerCtaRef} className="shrink-0 p-4 sm:p-6 border-t border-border bg-muted/30 flex justify-between gap-3 pb-[calc(env(safe-area-inset-bottom)+16px)]">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="flex-1 sm:flex-none"
            >
              <ArrowLeft className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <Button
              variant={currentStep === 6 ? "success" : "default"}
              onClick={handleNext}
              disabled={!isStepValid()}
              className="flex-1 sm:flex-none"
            >
              {currentStep === 6 ? (
                <>
                  <span className="hidden sm:inline">Submit Application</span>
                  <span className="sm:hidden">Submit</span>
                  <Check className="w-4 h-4 ml-1 sm:ml-2" />
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-4 h-4 ml-1 sm:ml-2" />
                </>
              )}
            </Button>
          </div>
          {!isStepValid() && (
            <div className="shrink-0 px-4 sm:px-6 pb-4 sm:pb-6 -mt-3 text-xs text-muted-foreground">
              {getDisabledHint()}
            </div>
          )}
        </>
      )}
    </Card>
  );

  if (variant === "page") {
    return (
      <div className="min-h-[100svh] bg-background">
        <AlertDialog open={isExitConfirmOpen} onOpenChange={setIsExitConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Discard application?</AlertDialogTitle>
              <AlertDialogDescription>
                You have progress in this application. If you leave now, you can resume later, or discard and start over.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep editing</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  setIsExitConfirmOpen(false);
                  handleClose();
                }}
              >
                Discard & exit
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <div className="mx-auto w-full max-w-2xl min-h-[100svh] sm:min-h-0 sm:py-6">
          <div className="min-h-[100svh] sm:min-h-0 sm:max-h-[calc(100svh-48px)]">{content}</div>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-foreground/50 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ duration: 0.3, type: "spring", damping: 25 }}
          className="w-full sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden"
        >
          {content}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LoanApplicationForm;
