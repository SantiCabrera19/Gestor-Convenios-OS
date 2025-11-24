"use client";

import React, { useEffect, useState } from "react";
import { useConvenioMarcoStore } from "@/stores/convenioMarcoStore";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { BuildingIcon, UserIcon, CalendarIcon, CheckIcon, ClipboardCheckIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { Label } from "@/app/components/ui/label";
import { Form } from "@/app/components/ui/form";
import { Modal } from '@/app/components/ui/modal';
import { SuccessModal } from "@/app/components/ui/success-modal";
import { cn } from "@/lib/utils";

// Esquemas de validación para cada paso
const entidadSchema = z.object({
  entidad_nombre: z.string().min(2, "El nombre de la entidad es requerido"),
  entidad_cuit: z.string().min(11, "CUIT debe tener 11 dígitos").regex(/^\d+$/, "Solo números"),
  entidad_domicilio: z.string().min(5, "Domicilio requerido"),
  entidad_ciudad: z.string().min(2, "Ciudad requerida"),
});

const representanteSchema = z.object({
  entidad_representante: z.string().min(2, "Nombre del representante requerido"),
  entidad_dni: z.string().min(7, "DNI debe tener al menos 7 dígitos").regex(/^\d+$/, "Solo números"),
  entidad_cargo: z.string().min(2, "Cargo del representante requerido"),
});

const proyectoSchema = z.object({
  unidad_ejecutora_facultad: z.string().min(2, "Dato requerido"),
  unidad_ejecutora_empresa: z.string().min(2, "Dato requerido"),
  asignatura: z.string().min(2, "Dato requerido"),
  carrera: z.string().min(2, "Dato requerido"),
  objetivo_general: z.string().min(5, "Dato requerido"),
  vigencia_anios: z.string().regex(/^\d+$/, "Solo números"),
  extincion_dias: z.string().regex(/^\d+$/, "Solo números"),
});

const firmaSchema = z.object({
  dia: z.string().min(1, "Día de firma requerido").regex(/^\d+$/, "Solo números"),
  mes: z.string().min(2, "Mes de firma requerido"),
});

interface AcuerdoColaboracionFormProps {
  currentStep: number;
  onStepChange: (step: number) => void;
  formState: Record<string, any>;
  onFormStateChange: (formState: Record<string, any>) => void;
  onError: (error: string | null) => void;
  isSubmitting: boolean;
  setIsSubmitting: (submitting: boolean) => void;
  convenioIdFromUrl?: string | null;
  mode?: string | null;
  onFinalSubmit: () => Promise<void>;
}

export default function AcuerdoColaboracionForm({
  currentStep,
  onStepChange,
  formState,
  onFormStateChange,
  onError,
  isSubmitting,
  setIsSubmitting,
  convenioIdFromUrl,
  mode,
  onFinalSubmit
}: AcuerdoColaboracionFormProps) {
  const { convenioData, updateConvenioData } = useConvenioMarcoStore();
  const router = useRouter();
  const [validationSchema, setValidationSchema] = useState<z.ZodTypeAny>(entidadSchema);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Helpers para meses y días
  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  const diasPorMes = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  useEffect(() => {
    switch (currentStep) {
      case 1:
        setValidationSchema(entidadSchema);
        break;
      case 2:
        setValidationSchema(representanteSchema);
        break;
      case 3:
        setValidationSchema(proyectoSchema);
        break;
      case 4:
        setValidationSchema(firmaSchema);
        break;
    }
  }, [currentStep]);

  const getDefaultValues = () => {
    if (formState[currentStep]) {
      return formState[currentStep];
    }
    switch(currentStep) {
      case 1:
        return {
          entidad_nombre: convenioData?.entidad_nombre || '',
          entidad_cuit: convenioData?.entidad_cuit || '',
          entidad_domicilio: convenioData?.entidad_domicilio || '',
          entidad_ciudad: convenioData?.entidad_ciudad || '',
        };
      case 2:
        return {
          entidad_representante: convenioData?.entidad_representante || '',
          entidad_dni: convenioData?.entidad_dni || '',
          entidad_cargo: convenioData?.entidad_cargo || '',
        };
      case 3:
        return {
          unidad_ejecutora_facultad: convenioData?.unidad_ejecutora_facultad || '',
          unidad_ejecutora_empresa: convenioData?.unidad_ejecutora_empresa || '',
          asignatura: convenioData?.asignatura || '',
          carrera: convenioData?.carrera || '',
          objetivo_general: convenioData?.objetivo_general || '',
          vigencia_anios: convenioData?.vigencia_anios || '',
          extincion_dias: convenioData?.extincion_dias || '',
        };
      case 4:
        return {
          dia: convenioData?.dia || '',
          mes: convenioData?.mes || '',
        };
      default:
        return {};
    }
  };

  const form = useForm<any>({
    resolver: zodResolver(validationSchema),
    defaultValues: getDefaultValues(),
    mode: "onChange"
  });

  useEffect(() => {
    form.reset(getDefaultValues());
  }, [currentStep]);

  const onSubmit = async (data: z.infer<typeof validationSchema>) => {
    try {
      const newFormState = {
        ...formState,
        [currentStep]: data,
      };
      onFormStateChange(newFormState);
      
      // Actualizar store con 'all' para mantener estructura plana
      updateConvenioData('all', {
        ...convenioData,
        ...data
      });

      if (currentStep < 5) {
        onStepChange(currentStep + 1);
      }
    } catch (error) {
      console.error("Error en el formulario:", error);
      onError("Ocurrió un error al procesar el formulario.");
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 animate-in fade-in-0">
            <div className="space-y-2 mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <div className="p-1.5 rounded-full bg-green-500/20 text-green-600">
                  <BuildingIcon className="h-5 w-5" />
                </div>
                Datos de la Entidad
              </h2>
              <p className="text-sm text-muted-foreground">
                Información de la entidad que realizará la colaboración.
              </p>
            </div>

            <div className="border border-border rounded-lg p-5 bg-card space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="entidad_nombre">Nombre de la Entidad *</Label>
                  <Input
                    id="entidad_nombre"
                    className="border-border focus-visible:ring-primary"
                    {...form.register("entidad_nombre")}
                  />
                  {form.formState.errors.entidad_nombre?.message && (
                    <p className="text-sm text-red-500">{String(form.formState.errors.entidad_nombre.message)}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="entidad_cuit">CUIT (sin guiones) *</Label>
                  <Input
                    id="entidad_cuit"
                    {...form.register("entidad_cuit")}
                  />
                  {form.formState.errors.entidad_cuit?.message && (
                    <p className="text-sm text-red-500">{String(form.formState.errors.entidad_cuit.message)}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="entidad_domicilio">Domicilio *</Label>
                  <Input
                    id="entidad_domicilio"
                    className="border-border focus-visible:ring-primary"
                    {...form.register("entidad_domicilio")}
                  />
                  {form.formState.errors.entidad_domicilio?.message && (
                    <p className="text-sm text-red-500">{String(form.formState.errors.entidad_domicilio.message)}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="entidad_ciudad">Ciudad *</Label>
                  <Input
                    id="entidad_ciudad"
                    className="border-border focus-visible:ring-primary"
                    {...form.register("entidad_ciudad")}
                  />
                  {form.formState.errors.entidad_ciudad?.message && (
                    <p className="text-sm text-red-500">{String(form.formState.errors.entidad_ciudad.message)}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-in fade-in-0">
            <div className="space-y-2 mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <div className="p-1.5 rounded-full bg-green-500/20 text-green-600">
                  <UserIcon className="h-5 w-5" />
                </div>
                Datos del Representante
              </h2>
              <p className="text-sm text-muted-foreground">
                Información del representante de la entidad.
              </p>
            </div>

            <div className="border border-border rounded-lg p-5 bg-card space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="entidad_representante">Nombre del Representante *</Label>
                  <Input
                    id="entidad_representante"
                    className="border-border focus-visible:ring-primary"
                    {...form.register("entidad_representante")}
                  />
                  {form.formState.errors.entidad_representante?.message && (
                    <p className="text-sm text-red-500">{String(form.formState.errors.entidad_representante.message)}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="entidad_dni">DNI del Representante *</Label>
                  <Input
                    id="entidad_dni"
                    {...form.register("entidad_dni")}
                  />
                  {form.formState.errors.entidad_dni?.message && (
                    <p className="text-sm text-red-500">{String(form.formState.errors.entidad_dni.message)}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="entidad_cargo">Cargo del Representante *</Label>
                  <Input
                    id="entidad_cargo"
                    className="border-border focus-visible:ring-primary"
                    {...form.register("entidad_cargo")}
                  />
                  {form.formState.errors.entidad_cargo?.message && (
                    <p className="text-sm text-red-500">{String(form.formState.errors.entidad_cargo.message)}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-in fade-in-0">
            <div className="space-y-2 mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <div className="p-1.5 rounded-full bg-green-500/20 text-green-600">
                  <ClipboardCheckIcon className="h-5 w-5" />
                </div>
                Información del Proyecto
              </h2>
              <p className="text-sm text-muted-foreground">Completa los detalles académicos y parámetros del acuerdo.</p>
            </div>
            <div className="border border-border rounded-lg p-5 bg-card space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="unidad_ejecutora_facultad">Unidad Ejecutora (Facultad) *</Label>
                  <Input id="unidad_ejecutora_facultad" className="border-border focus-visible:ring-primary" {...form.register("unidad_ejecutora_facultad")} />
                  {form.formState.errors.unidad_ejecutora_facultad?.message && (
                    <p className="text-sm text-red-500">{String(form.formState.errors.unidad_ejecutora_facultad.message)}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unidad_ejecutora_empresa">Unidad Ejecutora (Entidad) *</Label>
                  <Input id="unidad_ejecutora_empresa" className="border-border focus-visible:ring-primary" {...form.register("unidad_ejecutora_empresa")} />
                  {form.formState.errors.unidad_ejecutora_empresa?.message && (
                    <p className="text-sm text-red-500">{String(form.formState.errors.unidad_ejecutora_empresa.message)}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="asignatura">Asignatura *</Label>
                  <Input id="asignatura" className="border-border focus-visible:ring-primary" {...form.register("asignatura")} />
                  {form.formState.errors.asignatura?.message && (
                    <p className="text-sm text-red-500">{String(form.formState.errors.asignatura.message)}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="carrera">Carrera *</Label>
                  <Input id="carrera" className="border-border focus-visible:ring-primary" {...form.register("carrera")} />
                  {form.formState.errors.carrera?.message && (
                    <p className="text-sm text-red-500">{String(form.formState.errors.carrera.message)}</p>
                  )}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="objetivo_general">Objetivo General *</Label>
                  <Textarea id="objetivo_general" className="border-border focus-visible:ring-primary" {...form.register("objetivo_general")} />
                  {form.formState.errors.objetivo_general?.message && (
                    <p className="text-sm text-red-500">{String(form.formState.errors.objetivo_general.message)}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vigencia_anios">Años de Vigencia *</Label>
                  <Input id="vigencia_anios" className="border-border focus-visible:ring-primary" {...form.register("vigencia_anios")} />
                  {form.formState.errors.vigencia_anios?.message && (
                    <p className="text-sm text-red-500">{String(form.formState.errors.vigencia_anios.message)}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="extincion_dias">Días de Extinción *</Label>
                  <Input id="extincion_dias" className="border-border focus-visible:ring-primary" {...form.register("extincion_dias")} />
                  {form.formState.errors.extincion_dias?.message && (
                    <p className="text-sm text-red-500">{String(form.formState.errors.extincion_dias.message)}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6 animate-in fade-in-0">
            <div className="space-y-2 mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <div className="p-1.5 rounded-full bg-green-500/20 text-green-600">
                  <CalendarIcon className="h-5 w-5" />
                </div>
                Datos de la Firma
              </h2>
              <p className="text-sm text-muted-foreground">
                Información para la firma del acuerdo.
              </p>
            </div>

            <div className="border border-border rounded-lg p-5 bg-card space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dia">Día de Firma *</Label>
                  <select
                    id="dia"
                    className="border border-border focus-visible:ring-2 focus-visible:ring-primary rounded-md w-full h-10 px-3 bg-card"
                    {...form.register("dia", { required: true })}
                    onChange={e => {
                      form.setValue("dia", e.target.value);
                    }}
                    value={form.watch("dia") || ""}
                  >
                    <option value="">Seleccionar día</option>
                    {(() => {
                      const mesIdx = meses.indexOf(form.watch("mes"));
                      const dias = mesIdx >= 0 ? diasPorMes[mesIdx] : 31;
                      return Array.from({ length: dias }, (_, i) => i + 1).map(dia => (
                        <option key={dia} value={dia}>{dia}</option>
                      ));
                    })()}
                  </select>
                  {form.formState.errors.dia?.message && (
                    <p className="text-sm text-red-500">{String(form.formState.errors.dia.message)}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mes">Mes de Firma *</Label>
                  <select
                    id="mes"
                    className="border border-border focus-visible:ring-2 focus-visible:ring-primary rounded-md w-full h-10 px-3 bg-card"
                    {...form.register("mes", { required: true })}
                    onChange={e => {
                      form.setValue("mes", e.target.value);
                      form.setValue("dia", "");
                    }}
                    value={form.watch("mes") || ""}
                  >
                    <option value="">Seleccionar mes</option>
                    {meses.map((mes) => (
                      <option key={mes} value={mes}>{mes}</option>
                    ))}
                  </select>
                  {form.formState.errors.mes?.message && (
                    <p className="text-sm text-red-500">{String(form.formState.errors.mes.message)}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6 animate-in fade-in-0">
            <div className="space-y-2 mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <div className="p-1.5 rounded-full bg-green-500/20 text-green-600">
                  <CheckIcon className="h-5 w-5" />
                </div>
                Revisión y Finalización
              </h2>
              <p className="text-sm text-muted-foreground">
                Revisa toda la información antes de crear el acuerdo.
              </p>
            </div>

            <div className="space-y-6">
              {/* Datos de la Entidad */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-green-500/10 to-green-600/10 rounded-xl blur-xl"></div>
                <div className="relative bg-card/80 backdrop-blur-xl border border-border/60 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-orange-600 mb-4 flex items-center gap-2">
                    <BuildingIcon className="h-5 w-5" />
                    Datos de la Entidad
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><span className="font-medium">Entidad:</span> {convenioData?.entidad_nombre}</div>
                    <div><span className="font-medium">CUIT:</span> {convenioData?.entidad_cuit}</div>
                    <div><span className="font-medium">Domicilio:</span> {convenioData?.entidad_domicilio}</div>
                    <div><span className="font-medium">Ciudad:</span> {convenioData?.entidad_ciudad}</div>
                  </div>
                </div>
              </div>

              {/* Datos del Representante */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-green-500/10 to-green-600/10 rounded-xl blur-xl"></div>
                <div className="relative bg-card/80 backdrop-blur-xl border border-border/60 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-teal-600 mb-4 flex items-center gap-2">
                    <UserIcon className="h-5 w-5" />
                    Datos del Representante
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><span className="font-medium">Representante:</span> {convenioData?.entidad_representante}</div>
                    <div><span className="font-medium">DNI:</span> {convenioData?.entidad_dni}</div>
                    <div><span className="font-medium">Cargo:</span> {convenioData?.entidad_cargo}</div>
                  </div>
                </div>
              </div>

              {/* Información del Proyecto */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-green-500/10 to-green-600/10 rounded-xl blur-xl"></div>
                <div className="relative bg-card/80 backdrop-blur-xl border border-border/60 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-purple-600 mb-4 flex items-center gap-2">
                    <ClipboardCheckIcon className="h-5 w-5" />
                    Información del Proyecto
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><span className="font-medium">Unidad Ejecutora (Facultad):</span> {convenioData?.unidad_ejecutora_facultad}</div>
                      <div><span className="font-medium">Unidad Ejecutora (Entidad):</span> {convenioData?.unidad_ejecutora_empresa}</div>
                      <div><span className="font-medium">Asignatura:</span> {convenioData?.asignatura}</div>
                      <div><span className="font-medium">Carrera:</span> {convenioData?.carrera}</div>
                      <div><span className="font-medium">Años de Vigencia:</span> {convenioData?.vigencia_anios}</div>
                      <div><span className="font-medium">Días de Extinción:</span> {convenioData?.extincion_dias}</div>
                    </div>
                    <div className="mt-4">
                      <div><span className="font-medium">Objetivo General:</span></div>
                      <div className="mt-1 text-muted-foreground">{convenioData?.objetivo_general}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Datos de la Firma */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-green-500/10 to-green-600/10 rounded-xl blur-xl"></div>
                <div className="relative bg-card/80 backdrop-blur-xl border border-border/60 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-indigo-600 mb-4 flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    Datos de la Firma
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><span className="font-medium">Día de Firma:</span> {convenioData?.dia}</div>
                      <div><span className="font-medium">Mes de Firma:</span> {convenioData?.mes}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="confirmacion"
                  className="rounded border-border"
                  {...form.register("confirmacion")}
                />
                <Label htmlFor="confirmacion" className="text-sm">
                  Confirmo que toda la información es correcta y deseo crear el acuerdo
                </Label>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-1 mb-8">
            {renderStepContent()}
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => onStepChange(currentStep - 1)}
                disabled={isSubmitting}
                className="px-4 transition-all"
              >
                <ChevronLeftIcon className="h-4 w-4 mr-1" />
                Anterior
              </Button>
            )}
            {currentStep === 4 && (
              <Button
                type="submit"
                variant="default"
                disabled={Object.values(form.formState.errors).length > 0 || isSubmitting}
                className="px-4 transition-all"
              >
                Siguiente <ChevronRightIcon className="h-4 w-4 ml-1" />
              </Button>
            )}
            {currentStep === 5 && (
              <>
                {convenioData?.status === 'enviado' ? (
                  <div className="w-full text-center mt-2">
                    <span className="text-xs text-muted-foreground">Este convenio ya fue enviado y no puede modificarse.</span>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="default"
                    disabled={isSubmitting}
                    onClick={() => setShowConfirmModal(true)}
                    className="px-4 transition-all"
                  >
                    Guardar y Enviar acuerdo
                  </Button>
                )}
                {showConfirmModal && (
                  <Modal onClose={() => setShowConfirmModal(false)}>
                    <div className="p-6">
                      <h2 className="text-lg font-semibold mb-4">Confirmar envío</h2>
                      <p className="mb-6">¿Deseas enviar este acuerdo de colaboración? Una vez enviado no podrás volver a modificarlo.</p>
                      <div className="flex justify-end gap-2">
                        <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
                          Volver
                        </Button>
                        <Button
                          variant="default"
                          disabled={isSubmitting}
                          onClick={onFinalSubmit}
                        >
                          Sí, enviar
                        </Button>
                      </div>
                    </div>
                  </Modal>
                )}
              </>
            )}
            {currentStep < 4 && (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="px-4 transition-all"
              >
                Siguiente <ChevronRightIcon className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </form>
      </Form>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="¡Acuerdo de Colaboración Enviado!"
        message="Tu acuerdo de colaboración ha sido enviado exitosamente."
        redirectText="Volver al Inicio"
        autoRedirectSeconds={5}
        onRedirect={() => {
          setShowSuccessModal(false);
          router.push('/protected');
        }}
      />
    </div>
  );
}