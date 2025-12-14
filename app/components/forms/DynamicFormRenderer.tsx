"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { FormSchema, FormField } from "@/lib/types/dynamic-form";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/app/components/ui/card";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { StepIndicator } from "./StepIndicator";
import { motion, AnimatePresence } from "framer-motion";
import { HorizontalStepper } from "./HorizontalStepper";

interface DynamicFormRendererProps {
  schema: FormSchema;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
}

export function DynamicFormRenderer({ schema, onSubmit, isSubmitting = false }: DynamicFormRendererProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(0); // -1 for back, 1 for next

  const totalSteps = schema.steps.length;
  const currentStepData = schema.steps[currentStep - 1];

  const {
    register,
    handleSubmit,
    trigger,
    setValue,
    watch,
    formState: { errors },
  } = useForm();

  const handleNext = async () => {
    const fieldsInStep = currentStepData.fields.map((f) => f.name);
    const isStepValid = await trigger(fieldsInStep);

    if (isStepValid) {
      setDirection(1);
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const handleBack = () => {
    setDirection(-1);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const onFormSubmit = (data: any) => {
    onSubmit(data);
  };

  const renderField = (field: FormField) => {
    const commonProps = {
      id: field.name,
      placeholder: field.placeholder,
      disabled: isSubmitting,
      className: "bg-background border-input focus:border-primary transition-colors"
    };

    const validationRules = {
      required: field.required,
      min: field.validation?.min,
      max: field.validation?.max,
      pattern: field.validation?.pattern ? new RegExp(field.validation.pattern) : undefined,
    };

    switch (field.type) {
      case "textarea":
        return (
          <Textarea
            {...commonProps}
            {...register(field.name, validationRules)}
            className={cn(commonProps.className, "min-h-[100px]")}
          />
        );
      case "select":
        return (
          <Select
            onValueChange={(value) => setValue(field.name, value)}
            disabled={isSubmitting}
          >
            <SelectTrigger className={commonProps.className}>
              <SelectValue placeholder={field.placeholder || "Seleccionar..."} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case "checkbox":
        return (
          <div className="flex items-center space-x-3 p-4 rounded-lg border border-border bg-background">
            <Checkbox
              id={field.name}
              onCheckedChange={(checked) => setValue(field.name, checked)}
              disabled={isSubmitting}
            />
            <label
              htmlFor={field.name}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              {field.label}
            </label>
          </div>
        );
      case "date":
        return (
          <Input
            type="date"
            {...commonProps}
            {...register(field.name, validationRules)}
          />
        );
      default:
        return (
          <Input
            type={field.type}
            {...commonProps}
            {...register(field.name, validationRules)}
          />
        );
    }
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 20 : -20,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 20 : -20,
      opacity: 0,
    }),
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

      {/* Left Column: Form Content */}
      <div className="lg:col-span-8 order-2 lg:order-1">

        {/* Top Stepper Indicator (New Premium Component) */}
        <div className="mb-8">
          <HorizontalStepper steps={schema.steps} currentStep={currentStep} />
        </div>

        <Card className="border border-border/50 bg-card/50 backdrop-blur-sm shadow-xl overflow-hidden relative">
          <CardHeader className="pb-4 border-b border-border/50 bg-muted/5">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-foreground">
                  {currentStepData.title || `Paso ${currentStep}`}
                </CardTitle>
                {currentStepData.description && (
                  <CardDescription className="mt-1 text-base">
                    {currentStepData.description}
                  </CardDescription>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-8 min-h-[400px]">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentStep}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: "circOut" }}
                className="space-y-6"
              >
                {currentStepData.fields.length > 0 ? (
                  currentStepData.fields.map((field) => (
                    <div key={field.name} className="space-y-2 group">
                      {field.type !== "checkbox" && (
                        <Label htmlFor={field.name} className="text-sm font-medium text-foreground/90 group-focus-within:text-primary transition-colors">
                          {field.label} {field.required && <span className="text-destructive">*</span>}
                        </Label>
                      )}
                      {renderField(field)}
                      {errors[field.name] && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="text-sm text-destructive font-medium flex items-center gap-1"
                        >
                          <span className="w-1 h-1 rounded-full bg-destructive inline-block" />
                          {errors[field.name]?.message as string || "Este campo es requerido o inválido"}
                        </motion.p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                    <CheckCircle2 className="w-16 h-16 mb-4 text-primary/20" />
                    <p className="text-lg font-medium text-foreground">Todo listo en este paso</p>
                    <p className="text-sm">Puede continuar al siguiente paso.</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </CardContent>

          <CardFooter className="flex justify-between border-t border-border/50 bg-muted/5 p-6">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1 || isSubmitting}
              className="bg-background hover:bg-muted transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Anterior
            </Button>

            {currentStep < totalSteps ? (
              <Button onClick={handleNext} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-200 hover:scale-105">
                Siguiente
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit(onFormSubmit)} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20 transition-all duration-200 hover:scale-105">
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    Finalizar Solicitud
                    <CheckCircle2 className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>

      {/* Right Column: Steps Indicator (Sticky) */}
      <div className="lg:col-span-4 order-1 lg:order-2">
        <div className="sticky top-24">
          <Card className="border border-border/50 shadow-xl bg-card/80 backdrop-blur-md">
            <CardHeader className="bg-muted/5 border-b border-border/50 pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <div className="w-2 h-6 bg-primary rounded-full" />
                Progreso del Convenio
              </CardTitle>
              <CardDescription>
                Complete los pasos requeridos para generar el documento.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <StepIndicator steps={schema.steps} currentStep={currentStep} />
            </CardContent>
          </Card>

          {/* Helper Tip Box */}
          <div className="mt-6 p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 text-sm text-blue-400">
            <p className="flex items-start gap-2">
              <span className="text-xl">💡</span>
              <span>
                <strong>Tip:</strong> Puede navegar entre los pasos completados haciendo clic en el indicador lateral.
              </span>
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
