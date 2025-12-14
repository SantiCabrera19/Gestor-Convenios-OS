"use client";

import { cn } from "@/shared/utils/cn";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { FormStep } from "@/shared/types/dynamic-form";

interface HorizontalStepperProps {
    steps: FormStep[];
    currentStep: number;
}

export function HorizontalStepper({ steps, currentStep }: HorizontalStepperProps) {
    return (
        <div className="w-full py-6">
            <div className="relative flex items-center justify-between w-full max-w-3xl mx-auto px-4">
                {/* Connecting Line Background */}
                <div className="absolute left-0 top-[20px] w-full h-[2px] bg-muted -z-10" />

                {/* Active Progress Line */}
                <motion.div
                    className="absolute left-0 top-[20px] h-[2px] bg-primary -z-10"
                    initial={{ width: "0%" }}
                    animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                />

                {steps.map((step, index) => {
                    const stepNumber = index + 1;
                    const isActive = stepNumber === currentStep;
                    const isCompleted = stepNumber < currentStep;

                    return (
                        <div key={step.id || index} className="flex flex-col items-center relative z-10">
                            {/* Step Circle */}
                            <motion.div
                                initial={false}
                                animate={{
                                    scale: isActive ? 1.1 : 1,
                                    backgroundColor: isCompleted || isActive ? "hsl(var(--primary))" : "hsl(var(--background))",
                                    borderColor: isCompleted || isActive ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
                                }}
                                className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300",
                                    isActive ? "ring-4 ring-primary/20" : "",
                                    !isActive && !isCompleted ? "bg-background border-muted-foreground/30 text-muted-foreground" : "text-primary-foreground"
                                )}
                            >
                                {isCompleted ? (
                                    <Check className="w-5 h-5" />
                                ) : (
                                    <span className="text-sm font-bold">
                                        {stepNumber}
                                    </span>
                                )}
                            </motion.div>

                            {/* Step Label */}
                            <div className="absolute top-12 w-32 flex justify-center">
                                <span
                                    className={cn(
                                        "text-xs font-medium mt-2 text-center leading-tight transition-colors duration-300",
                                        isActive || isCompleted ? "text-primary" : "text-muted-foreground"
                                    )}
                                >
                                    {step.title}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
            {/* Spacer for labels */}
            <div className="h-16" />
        </div>
    );
}
