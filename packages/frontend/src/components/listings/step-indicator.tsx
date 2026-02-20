import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  label: string;
  icon: React.ReactNode;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 py-6">
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isDone = index < currentStep;
        const isTodo = index > currentStep;

        return (
          <div key={index} className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  "h-12 w-12 rounded-full flex items-center justify-center transition-colors",
                  isActive && "bg-primary text-primary-foreground",
                  isDone && "bg-success text-success-foreground",
                  isTodo && "bg-secondary text-muted-foreground",
                )}
              >
                {isDone ? <Check className="h-5 w-5" /> : step.icon}
              </div>
              <span
                className={cn(
                  "text-xs font-body font-medium",
                  isActive && "text-primary",
                  isDone && "text-success",
                  isTodo && "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "w-12 h-0.5 mb-6",
                  index < currentStep ? "bg-success" : "bg-secondary",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
