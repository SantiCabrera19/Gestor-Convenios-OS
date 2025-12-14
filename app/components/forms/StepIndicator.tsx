"use client";

import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { FormStep } from "@/lib/types/dynamic-form";
import { motion } from "framer-motion";

interface StepIndicatorProps {
    steps: FormStep[];
    currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
    return (
        <div className="space-y-8 relative">
            {/* Vertical Line */}
            <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-muted/20 -z-10" />

            {steps.map((step, index) => {
                const stepNumber = index + 1;
                const isActive = stepNumber === currentStep;
                const isCompleted = stepNumber < currentStep;

                return (
                    <div key={step.id} className="flex items-start gap-4 relative group">
                        <div
                            className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10",
                                isActive
                                    ? "border-primary bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.5)] scale-110"
                                    : isCompleted
                                        ? "border-green-500 bg-green-500 text-white"
                                        : "border-muted-foreground/30 bg-background text-muted-foreground"
                            )}
                        >
                            {isCompleted ? (
                                <CheckCircle2 className="w-6 h-6 animate-in zoom-in duration-300" />
                            ) : (
                                <span className="font-bold">{stepNumber}</span>
                            )}
                        </div>

                        <div className={cn("flex-1 pt-1 transition-opacity duration-300", isActive ? "opacity-100" : "opacity-60")}>
                            <h3 className={cn("font-medium text-sm uppercase tracking-wider", isActive && "text-primary")}>
                                {step.title}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1">
                                {step.description}
                            </p>
                        </div>

                        {/* Active Indicator Dot */}
                        {isActive && (
                            <motion.div
                                layoutId="active-step-indicator"
                                className="absolute -left-4 top-3 w-1.5 h-4 bg-primary rounded-r-full"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3 }}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
