import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, CheckCircle, FileSearch, Shield, Database } from "lucide-react";

interface ProcessingScreenProps {
  onComplete: () => void;
}

const processingSteps = [
  { id: 1, label: "Submitting application", icon: FileSearch, duration: 2000 },
  { id: 2, label: "Verifying identity", icon: Shield, duration: 2500 },
  { id: 3, label: "Analyzing eligibility", icon: Database, duration: 3000 },
  { id: 4, label: "Finalizing decision", icon: CheckCircle, duration: 1500 },
];

const ProcessingScreen = ({ onComplete }: ProcessingScreenProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const processStep = (stepIndex: number) => {
      if (stepIndex >= processingSteps.length) {
        // All steps complete
        setTimeout(onComplete, 500);
        return;
      }

      setCurrentStep(stepIndex);

      timeout = setTimeout(() => {
        setCompletedSteps((prev) => [...prev, stepIndex]);
        processStep(stepIndex + 1);
      }, processingSteps[stepIndex].duration);
    };

    processStep(0);

    return () => clearTimeout(timeout);
  }, [onComplete]);

  return (
    <div className="p-8 text-center">
      {/* Animated Logo */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-24 h-24 mx-auto mb-8"
      >
        <div className="absolute inset-0 rounded-full bg-gradient-hero opacity-20 animate-pulse" />
        <div className="absolute inset-2 rounded-full bg-gradient-hero flex items-center justify-center shadow-glow">
          <Loader2 className="w-10 h-10 text-primary-foreground animate-spin" />
        </div>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="font-display text-2xl font-bold text-foreground mb-2"
      >
        Processing Your Application
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-muted-foreground mb-8"
      >
        Please wait while we review your information
      </motion.p>

      {/* Progress Steps */}
      <div className="max-w-sm mx-auto space-y-4">
        {processingSteps.map((step, index) => {
          const isCompleted = completedSteps.includes(index);
          const isCurrent = currentStep === index && !isCompleted;
          const isPending = index > currentStep;

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center gap-4 p-3 rounded-lg transition-all ${
                isCompleted
                  ? "bg-primary/10"
                  : isCurrent
                  ? "bg-secondary/10"
                  : "bg-muted/30"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  isCompleted
                    ? "bg-primary text-primary-foreground"
                    : isCurrent
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5" />
                ) : isCurrent ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <step.icon className="w-5 h-5" />
                )}
              </div>
              <span
                className={`text-sm font-medium ${
                  isCompleted
                    ? "text-primary"
                    : isCurrent
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
              {isCompleted && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="ml-auto text-xs text-primary font-medium"
                >
                  ✓ Done
                </motion.span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Loading Bar */}
      <div className="mt-8 max-w-sm mx-auto">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-hero rounded-full"
            initial={{ width: "0%" }}
            animate={{
              width: `${((completedSteps.length + 1) / (processingSteps.length + 1)) * 100}%`,
            }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    </div>
  );
};

export default ProcessingScreen;
