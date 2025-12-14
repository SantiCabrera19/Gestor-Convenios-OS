"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getFormDefinition } from "@/app/actions/get-form-definition";
import { DynamicFormRenderer } from "@/app/components/forms/dynamic/DynamicFormRenderer";
import { FormDefinition } from "@/shared/types/dynamic-form";
import { 
  Loader2, 
  Wrench, 
  ChevronLeftIcon, 
  CheckIcon, 
  EyeIcon,
  BuildingIcon,
  UserIcon,
  CalendarIcon,
  FileTextIcon
} from "lucide-react";
import { useToast } from "@/shared/components/ui/toast";
import { Button } from "@/shared/components/ui/button";
import { Progress } from "@/shared/components/ui/progress";
import { BackgroundPattern, SectionContainer } from "@/app/components/dashboard";
import { cn } from "@/shared/utils/cn";

// Mapa de iconos para el sidebar
const ICON_MAP: Record<string, any> = {
  BuildingIcon,
  UserIcon,
  CalendarIcon,
  FileTextIcon,
  CheckIcon
};

interface DynamicConvenioPageProps {
  convenioTypeId: number;
  title: string;
  slug: string;
}

export function DynamicConvenioPage({ convenioTypeId, title, slug }: DynamicConvenioPageProps) {
  const [formDef, setFormDef] = useState<FormDefinition | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const def = await getFormDefinition(convenioTypeId);
        if (isMounted) {
          setFormDef(def);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error loading form definition:", error);
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, [convenioTypeId]);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const convenioTitle = data.nombre || data.razon_social || data.entidad || `${title} - ${new Date().toLocaleDateString()}`;

      const response = await fetch('/api/convenios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: convenioTitle,
          template_slug: slug,
          form_data: data,
          convenio_type: slug
        })
      });

      const result = await response.json();
      
      if (!response.ok) throw new Error(result.error || "Error al crear el convenio");

      toast.success("¡Convenio Creado!", "El documento se ha generado y guardado exitosamente.");
      router.push('/protected');
      
    } catch (error: any) {
      console.error("Submit error:", error);
      toast.error("Error", error.message || "Ocurrió un error inesperado.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Cargando configuración del formulario...</p>
      </div>
    );
  }

  if (!formDef) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] p-8 text-center space-y-6 bg-card border border-dashed rounded-xl">
        <div className="p-4 rounded-full bg-yellow-500/10 text-yellow-600">
          <Wrench className="h-12 w-12" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Formulario en Configuración</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            No se encontró una receta activa para el <strong>{title}</strong>. 
            Es posible que el administrador esté realizando tareas de mantenimiento.
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push('/protected')}>
          Volver al Inicio
        </Button>
      </div>
    );
  }

  // Preparar pasos para el sidebar
  // Agregamos un paso extra "Revisión" al final si no existe en el schema
  const steps = [
    ...formDef.schema.steps,
    {
      id: 'review',
      title: 'Revisión',
      description: 'Revisá y enviá tu convenio',
      icon: 'FileTextIcon'
    }
  ];

  const progress = ((currentStep) / (steps.length - 1)) * 100;

  return (
    <>
      <div className="p-8 w-full relative">
        <div className="mb-8 border-b border-border/40 pb-6">
          <div className="flex items-center justify-between mb-2">
            <Link
              href="/protected"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeftIcon className="h-4 w-4 mr-1" />
              Volver al dashboard
            </Link>
          </div>
          <div className="mt-6">
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-muted-foreground mt-1">
              Complete la información solicitada para generar el documento automáticamente.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-2">
          {/* Contenido Principal */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-lg border shadow-sm animate-in fade-in-50 duration-300">
              {/* Stepper Header */}
              <div className="p-6 border-b border-border/60">
                <div className="flex items-center gap-4 overflow-x-auto pb-2">
                  {steps.map((step, idx) => (
                    <div key={step.id} className={cn(
                      "flex items-center gap-2 transition-all duration-300 min-w-fit",
                      idx === currentStep ? "text-primary font-medium" :
                      idx < currentStep ? "text-green-500" :
                      "text-muted-foreground"
                    )}>
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                        idx === currentStep ? "border-primary bg-primary/10" :
                        idx < currentStep ? "border-green-500 bg-green-500/10" :
                        "border-muted-foreground/30 bg-background"
                      )}>
                        {idx < currentStep ? (
                          <CheckIcon className="h-4 w-4" />
                        ) : (
                          <span>{idx + 1}</span>
                        )}
                      </div>
                      <span className="hidden md:inline text-sm">{step.title}</span>
                    </div>
                  ))}
                </div>
                <Progress value={progress} className="h-1 mt-4" />
              </div>

              {/* Form Renderer */}
              <DynamicFormRenderer 
                schema={formDef.schema} 
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                onStepChange={setCurrentStep}
                externalStep={currentStep}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <SectionContainer title="Progreso">
              <div className="space-y-4">
                {steps.map((step, idx) => {
                  const isClickable = idx < currentStep;
                  const Icon = ICON_MAP[step.icon || 'FileTextIcon'] || FileTextIcon;
                  
                  return (
                    <button
                      key={step.id}
                      type="button"
                      disabled={!isClickable}
                      onClick={() => {
                        if (isClickable) setCurrentStep(idx);
                      }}
                      className={cn(
                        "w-full text-left p-4 rounded-lg border transition-all duration-300 focus:outline-none",
                        idx === currentStep ? "bg-primary/5 border-primary/20 scale-105 shadow-sm" :
                        idx < currentStep ? "bg-green-500/5 border-green-500/20" :
                        "bg-card border-border",
                        isClickable ? "cursor-pointer hover:ring-2 hover:ring-primary/30" : "opacity-60 cursor-not-allowed"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "p-2 rounded-lg",
                          idx === currentStep ? "bg-primary/10" :
                          idx < currentStep ? "bg-green-500/10" :
                          "bg-muted"
                        )}>
                          {idx < currentStep ? (
                            <CheckIcon className="h-5 w-5 text-green-500" />
                          ) : (
                            <Icon className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <h3 className={cn(
                            "font-medium",
                            idx === currentStep ? "text-primary" :
                            idx < currentStep ? "text-green-500" :
                            "text-muted-foreground"
                          )}>
                            {step.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </SectionContainer>
            
            <SectionContainer title="Vista previa">
              <div className="space-y-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2 text-sm opacity-50 cursor-not-allowed"
                  disabled
                  title="Disponible próximamente"
                >
                  <EyeIcon className="h-4 w-4" />
                  Vista previa Word
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  La vista previa se generará al finalizar.
                </p>
              </div>
            </SectionContainer>
          </div>
        </div>
      </div>
    </>
  );
}
