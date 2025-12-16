"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FormSchema, FormStep, FormField } from '@/shared/types/dynamic-form';
import { Button } from "@/shared/components/ui/button";
import { Form } from "@/shared/components/ui/form";
import { DynamicField } from './DynamicField';
import { BuildingIcon, UserIcon, CalendarIcon, CheckIcon, ChevronLeftIcon, ChevronRightIcon, FileTextIcon } from "lucide-react";
import { Modal } from '@/shared/components/ui/modal';

// Mapa de iconos disponibles
const ICON_MAP: Record<string, any> = {
  BuildingIcon,
  UserIcon,
  CalendarIcon,
  CheckIcon,
  FileTextIcon
};

interface DynamicFormRendererProps {
  schema: FormSchema;
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  isSubmitting?: boolean;
}

export function DynamicFormRenderer({
  schema,
  initialData = {},
  onSubmit,
  isSubmitting = false,
  onStepChange, // Nuevo prop para notificar cambios
  externalStep // Nuevo prop para controlar desde fuera (opcional)
}: DynamicFormRendererProps & { 
  onStepChange?: (step: number) => void;
  externalStep?: number;
}) {
  const [internalStep, setInternalStep] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [formData, setFormData] = useState(initialData);

  // Usar paso externo si existe, sino el interno
  const currentStep = externalStep !== undefined ? externalStep : internalStep;

  // Función para cambiar paso
  const changeStep = (newStep: number) => {
    if (externalStep === undefined) {
      setInternalStep(newStep);
    }
    onStepChange?.(newStep);
  };
  const generateStepSchema = (step: FormStep) => {
    const shape: Record<string, any> = {};

    step.fields.forEach((field) => {
      let fieldSchema: any = z.string();

      if (field.required) {
        fieldSchema = fieldSchema.min(1, "Este campo es requerido");
      } else {
        fieldSchema = fieldSchema.optional();
      }

      if (field.validation) {
        if (field.validation.min) {
          fieldSchema = fieldSchema.min(field.validation.min, field.validation.message || `Mínimo ${field.validation.min} caracteres`);
        }
        if (field.validation.max) {
          fieldSchema = fieldSchema.max(field.validation.max, field.validation.message || `Máximo ${field.validation.max} caracteres`);
        }
        if (field.validation.pattern) {
          fieldSchema = fieldSchema.regex(new RegExp(field.validation.pattern), field.validation.message || "Formato inválido");
        }
      }

      shape[field.name] = fieldSchema;
    });

    return z.object(shape);
  };

  const currentStepData = schema.steps[currentStep];
  const isLastStep = currentStep === schema.steps.length; // El último paso es la revisión (steps.length)

  // Configurar formulario
  const form = useForm({
    resolver: isLastStep ? undefined : zodResolver(generateStepSchema(currentStepData)),
    defaultValues: formData,
    mode: "onChange"
  });

  // Resetear formulario cuando cambia el paso para cargar valores guardados
  useEffect(() => {
    if (!isLastStep) {
      form.reset(formData);
    }
  }, [currentStep, formData, isLastStep, form]);

  const handleNext = async (data: any) => {
    // Guardar datos del paso actual
    const updatedData = { ...formData, ...data };
    setFormData(updatedData);
    
    if (currentStep < schema.steps.length) {
      changeStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      changeStep(currentStep - 1);
    }
  };

  const handleFinalSubmit = async () => {
    await onSubmit(formData);
    setShowConfirmModal(false);
  };

  // Renderizado del paso de revisión
  const renderReviewStep = () => {
    return (
      <div className="space-y-6 animate-in fade-in-0">
        <div className="space-y-2 mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <div className="p-1.5 rounded-full bg-blue-500/20 text-blue-600">
              <CheckIcon className="h-5 w-5" />
            </div>
            Revisión y Finalización
          </h2>
          <p className="text-sm text-muted-foreground">
            Revisa toda la información antes de enviar.
          </p>
        </div>

        <div className="space-y-6">
          {schema.steps.map((step, idx) => {
            const Icon = ICON_MAP[step.icon || 'FileTextIcon'] || FileTextIcon;
            return (
              <div key={step.id} className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent rounded-xl"></div>
                <div className="relative bg-card/80 backdrop-blur-xl border border-border/60 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-foreground/80 mb-4 flex items-center gap-2">
                    <Icon className="h-5 w-5" />
                    {step.title}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {step.fields.map(field => (
                      <div key={field.name}>
                        <span className="font-medium text-muted-foreground">{field.label}:</span>{' '}
                        <span className="text-foreground">{formData[field.name] || '-'}</span>
                      </div>
                    ))}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="absolute top-4 right-4 text-muted-foreground hover:text-primary"
                    onClick={() => changeStep(idx)}
                  >
                    Editar
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {isLastStep ? (
        // Paso de Revisión
        <>
          {renderReviewStep()}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={isSubmitting}
            >
              <ChevronLeftIcon className="h-4 w-4 mr-1" />
              Anterior
            </Button>
            <Button
              type="button"
              variant="default"
              disabled={isSubmitting}
              onClick={() => setShowConfirmModal(true)}
            >
              Guardar y Enviar
            </Button>
          </div>
        </>
      ) : (
        // Pasos del Formulario
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleNext)} className="space-y-6">
            <div className="space-y-2 mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <div className="p-1.5 rounded-full bg-blue-500/20 text-blue-600">
                  {(() => {
                    const Icon = ICON_MAP[currentStepData.icon || 'FileTextIcon'] || FileTextIcon;
                    return <Icon className="h-5 w-5" />;
                  })()}
                </div>
                {currentStepData.title}
              </h2>
              {currentStepData.description && (
                <p className="text-sm text-muted-foreground">
                  {currentStepData.description}
                </p>
              )}
            </div>

            <div className="border border-border rounded-lg p-5 bg-card space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentStepData.fields.map((field) => (
                  <div key={field.name} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                    <DynamicField field={field} form={form} />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
              {currentStep > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={isSubmitting}
                >
                  <ChevronLeftIcon className="h-4 w-4 mr-1" />
                  Anterior
                </Button>
              )}
              <Button
                type="submit"
                variant="default"
                disabled={isSubmitting}
              >
                Siguiente <ChevronRightIcon className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </form>
        </Form>
      )}

      {/* Modal de Confirmación */}
      {showConfirmModal && (
        <Modal onClose={() => setShowConfirmModal(false)}>
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Confirmar envío</h2>
            <p className="mb-6">¿Deseas enviar este convenio? Una vez enviado no podrás volver a modificarlo.</p>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
                Volver
              </Button>
              <Button
                variant="default"
                disabled={isSubmitting}
                onClick={handleFinalSubmit}
              >
                {isSubmitting ? 'Enviando...' : 'Sí, enviar'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
