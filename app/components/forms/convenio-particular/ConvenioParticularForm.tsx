"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import {
  Form,
} from "@/shared/components/ui/form";
import { BuildingIcon, UserIcon, ClipboardCheckIcon, CheckIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useConvenioMarcoStore } from "@/stores/convenioMarcoStore";
import { Modal } from '@/shared/components/ui/modal';
import { SuccessModal } from '@/shared/components/ui/success-modal';

// Esquemas de validación
const empresaSchema = z.object({
  empresa_nombre: z.string().min(2, "El nombre de la empresa es requerido"),
  empresa_cuit: z.string().min(11, "CUIT debe tener 11 dígitos").regex(/^\d+$/, "Solo números"),
  empresa_representante_nombre: z.string().min(2, "Nombre del representante requerido"),
  empresa_representante_caracter: z.string().min(2, "Carácter del representante requerido"),
  empresa_direccion_calle: z.string().min(5, "Dirección requerida"),
  empresa_direccion_ciudad: z.string().min(2, "Ciudad requerida"),
  empresa_tutor_nombre: z.string().min(2, "Nombre del tutor empresarial requerido"),
});

const alumnoSchema = z.object({
  alumno_nombre: z.string().min(2, "Nombre del alumno requerido"),
  alumno_carrera: z.string().min(2, "Carrera del alumno requerida"),
  alumno_dni: z.string().min(7, "DNI debe tener al menos 7 dígitos").regex(/^\d+$/, "Solo números"),
  alumno_legajo: z.string().min(1, "Legajo del alumno requerido").regex(/^\d+$/, "Solo números"),
});

const practicaSchema = z.object({
  fecha_inicio: z.string().min(1, "Fecha de inicio requerida"),
  fecha_fin: z.string().min(1, "Fecha de fin requerida"),
  practica_duracion: z.string().min(2, "Duración de la práctica requerida"),
  practica_tematica: z.string().min(10, "Descripción de la temática requerida"),
  facultad_docente_tutor_nombre: z.string().min(2, "Nombre del docente tutor requerido"),
  dia: z.string().min(1, "Día de firma requerido"),
  mes: z.string().min(1, "Mes de firma requerido"),
}).refine((data) => {
  if (data.fecha_inicio && data.fecha_fin) {
    return new Date(data.fecha_fin) >= new Date(data.fecha_inicio);
  }
  return true;
}, {
  message: "La fecha de fin no puede ser anterior a la fecha de inicio",
  path: ["fecha_fin"]
});

interface ConvenioParticularFormProps {
  currentStep: number;
  onStepChange: (step: number) => void;
  formState: Record<string, any>;
  onFormStateChange: (state: Record<string, any>) => void;
  onError: (error: string | null) => void;
  isSubmitting: boolean;
  setIsSubmitting: (isSubmitting: boolean) => void;
  convenioIdFromUrl?: string | null;
  mode?: string | null;
  onFinalSubmit: () => Promise<void>;
}

export default function ConvenioParticularForm({
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
}: ConvenioParticularFormProps) {
  const router = useRouter();
  const { updateConvenioData, convenioData } = useConvenioMarcoStore();
  const [validationSchema, setValidationSchema] = useState<z.ZodTypeAny>(empresaSchema);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  const diasPorMes = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  useEffect(() => {
    switch (currentStep) {
      case 1:
        setValidationSchema(empresaSchema);
        break;
      case 2:
        setValidationSchema(alumnoSchema);
        break;
      case 3:
        setValidationSchema(practicaSchema);
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
          empresa_nombre: convenioData?.empresa_nombre || '',
          empresa_cuit: convenioData?.empresa_cuit || '',
          empresa_representante_nombre: convenioData?.empresa_representante_nombre || '',
          empresa_representante_caracter: convenioData?.empresa_representante_caracter || '',
          empresa_direccion_calle: convenioData?.empresa_direccion_calle || '',
          empresa_direccion_ciudad: convenioData?.empresa_direccion_ciudad || '',
          empresa_tutor_nombre: convenioData?.empresa_tutor_nombre || '',
        };
      case 2:
        return {
          alumno_nombre: convenioData?.alumno_nombre || '',
          alumno_carrera: convenioData?.alumno_carrera || '',
          alumno_dni: convenioData?.alumno_dni || '',
          alumno_legajo: convenioData?.alumno_legajo || '',
        };
      case 3:
        return {
          fecha_inicio: convenioData?.fecha_inicio || '',
          fecha_fin: convenioData?.fecha_fin || '',
          practica_duracion: convenioData?.practica_duracion || '',
          practica_tematica: convenioData?.practica_tematica || '',
          facultad_docente_tutor_nombre: convenioData?.facultad_docente_tutor_nombre || '',
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

      if (currentStep < 4) {
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
                Datos de la Empresa
              </h2>
              <p className="text-sm text-muted-foreground">
                Información de la empresa donde se realizará la práctica.
              </p>
            </div>

            <div className="border border-border rounded-lg p-5 bg-card space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="empresa_nombre">Nombre de la Empresa *</Label>
                  <Input
                    id="empresa_nombre"
                    className="border-border focus-visible:ring-primary"
                    {...form.register("empresa_nombre")}
                  />
                  {form.formState.errors.empresa_nombre?.message && (
                    <p className="text-sm text-red-500">{String(form.formState.errors.empresa_nombre.message)}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="empresa_cuit">CUIT *</Label>
                  <Input
                    id="empresa_cuit"
                    {...form.register("empresa_cuit")}
                  />
                  {form.formState.errors.empresa_cuit?.message && (
                    <p className="text-sm text-red-500">{String(form.formState.errors.empresa_cuit.message)}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="empresa_representante_nombre">Representante Legal *</Label>
                  <Input
                    id="empresa_representante_nombre"
                    {...form.register("empresa_representante_nombre")}
                  />
                  {form.formState.errors.empresa_representante_nombre?.message && (
                    <p className="text-sm text-red-500">{String(form.formState.errors.empresa_representante_nombre.message)}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="empresa_representante_caracter">Carácter *</Label>
                  <Input
                    id="empresa_representante_caracter"
                    {...form.register("empresa_representante_caracter")}
                  />
                  {form.formState.errors.empresa_representante_caracter?.message && (
                    <p className="text-sm text-red-500">{String(form.formState.errors.empresa_representante_caracter.message)}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="empresa_direccion_calle">Dirección *</Label>
                  <Input
                    id="empresa_direccion_calle"
                    {...form.register("empresa_direccion_calle")}
                  />
                  {form.formState.errors.empresa_direccion_calle?.message && (
                    <p className="text-sm text-red-500">{String(form.formState.errors.empresa_direccion_calle.message)}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="empresa_direccion_ciudad">Ciudad *</Label>
                  <Input
                    id="empresa_direccion_ciudad"
                    {...form.register("empresa_direccion_ciudad")}
                  />
                  {form.formState.errors.empresa_direccion_ciudad?.message && (
                    <p className="text-sm text-red-500">{String(form.formState.errors.empresa_direccion_ciudad.message)}</p>
                  )}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="empresa_tutor_nombre">Tutor Empresarial *</Label>
                  <Input
                    id="empresa_tutor_nombre"
                    {...form.register("empresa_tutor_nombre")}
                  />
                  {form.formState.errors.empresa_tutor_nombre?.message && (
                    <p className="text-sm text-red-500">{String(form.formState.errors.empresa_tutor_nombre.message)}</p>
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
                Datos del Alumno
              </h2>
              <p className="text-sm text-muted-foreground">
                Información del estudiante.
              </p>
            </div>

            <div className="border border-border rounded-lg p-5 bg-card space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="alumno_nombre">Nombre Completo *</Label>
                  <Input
                    id="alumno_nombre"
                    {...form.register("alumno_nombre")}
                  />
                  {form.formState.errors.alumno_nombre?.message && (
                    <p className="text-sm text-red-500">{String(form.formState.errors.alumno_nombre.message)}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alumno_carrera">Carrera *</Label>
                  <Input
                    id="alumno_carrera"
                    {...form.register("alumno_carrera")}
                  />
                  {form.formState.errors.alumno_carrera?.message && (
                    <p className="text-sm text-red-500">{String(form.formState.errors.alumno_carrera.message)}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alumno_dni">DNI *</Label>
                  <Input
                    id="alumno_dni"
                    {...form.register("alumno_dni")}
                  />
                  {form.formState.errors.alumno_dni?.message && (
                    <p className="text-sm text-red-500">{String(form.formState.errors.alumno_dni.message)}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alumno_legajo">Legajo *</Label>
                  <Input
                    id="alumno_legajo"
                    {...form.register("alumno_legajo")}
                  />
                  {form.formState.errors.alumno_legajo?.message && (
                    <p className="text-sm text-red-500">{String(form.formState.errors.alumno_legajo.message)}</p>
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
                Detalles de la Práctica
              </h2>
              <p className="text-sm text-muted-foreground">
                Información específica de la práctica.
              </p>
            </div>

            <div className="border border-border rounded-lg p-5 bg-card space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fecha_inicio">Fecha Inicio *</Label>
                  <Input
                    id="fecha_inicio"
                    type="date"
                    {...form.register("fecha_inicio")}
                  />
                  {form.formState.errors.fecha_inicio?.message && (
                    <p className="text-sm text-red-500">{String(form.formState.errors.fecha_inicio.message)}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fecha_fin">Fecha Fin *</Label>
                  <Input
                    id="fecha_fin"
                    type="date"
                    {...form.register("fecha_fin")}
                  />
                  {form.formState.errors.fecha_fin?.message && (
                    <p className="text-sm text-red-500">{String(form.formState.errors.fecha_fin.message)}</p>
                  )}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="facultad_docente_tutor_nombre">Docente Tutor *</Label>
                  <Input
                    id="facultad_docente_tutor_nombre"
                    {...form.register("facultad_docente_tutor_nombre")}
                  />
                  {form.formState.errors.facultad_docente_tutor_nombre?.message && (
                    <p className="text-sm text-red-500">{String(form.formState.errors.facultad_docente_tutor_nombre.message)}</p>
                  )}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="practica_duracion">Duración *</Label>
                  <Input
                    id="practica_duracion"
                    {...form.register("practica_duracion")}
                  />
                  {form.formState.errors.practica_duracion?.message && (
                    <p className="text-sm text-red-500">{String(form.formState.errors.practica_duracion.message)}</p>
                  )}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="practica_tematica">Temática *</Label>
                  <Textarea
                    id="practica_tematica"
                    {...form.register("practica_tematica")}
                  />
                  {form.formState.errors.practica_tematica?.message && (
                    <p className="text-sm text-red-500">{String(form.formState.errors.practica_tematica.message)}</p>
                  )}
                </div>
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
                    {meses.map((mes, idx) => (
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
      case 4:
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
                Revisa toda la información antes de crear el convenio.
              </p>
            </div>

            <div className="space-y-6">
              {/* Datos de la Empresa */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-green-500/10 to-green-600/10 rounded-xl blur-xl"></div>
                <div className="relative bg-card/80 backdrop-blur-xl border border-border/60 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-green-600 mb-4 flex items-center gap-2">
                    <BuildingIcon className="h-5 w-5" />
                    Datos de la Empresa
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><span className="font-medium">Empresa:</span> {convenioData?.empresa_nombre}</div>
                    <div><span className="font-medium">CUIT:</span> {convenioData?.empresa_cuit}</div>
                    <div><span className="font-medium">Representante:</span> {convenioData?.empresa_representante_nombre}</div>
                    <div><span className="font-medium">Carácter:</span> {convenioData?.empresa_representante_caracter}</div>
                    <div><span className="font-medium">Dirección:</span> {convenioData?.empresa_direccion_calle}</div>
                    <div><span className="font-medium">Ciudad:</span> {convenioData?.empresa_direccion_ciudad}</div>
                    <div><span className="font-medium">Tutor:</span> {convenioData?.empresa_tutor_nombre}</div>
                  </div>
                </div>
              </div>

              {/* Datos del Alumno */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-green-500/10 to-green-600/10 rounded-xl blur-xl"></div>
                <div className="relative bg-card/80 backdrop-blur-xl border border-border/60 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-green-600 mb-4 flex items-center gap-2">
                    <UserIcon className="h-5 w-5" />
                    Datos del Alumno
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><span className="font-medium">Nombre:</span> {convenioData?.alumno_nombre}</div>
                    <div><span className="font-medium">Carrera:</span> {convenioData?.alumno_carrera}</div>
                    <div><span className="font-medium">DNI:</span> {convenioData?.alumno_dni}</div>
                    <div><span className="font-medium">Legajo:</span> {convenioData?.alumno_legajo}</div>
                  </div>
                </div>
              </div>

              {/* Detalles de la Práctica */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-green-500/10 to-green-600/10 rounded-xl blur-xl"></div>
                <div className="relative bg-card/80 backdrop-blur-xl border border-border/60 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-green-600 mb-4 flex items-center gap-2">
                    <ClipboardCheckIcon className="h-5 w-5" />
                    Detalles de la Práctica
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><span className="font-medium">Inicio:</span> {convenioData?.fecha_inicio}</div>
                      <div><span className="font-medium">Fin:</span> {convenioData?.fecha_fin}</div>
                      <div><span className="font-medium">Duración:</span> {convenioData?.practica_duracion}</div>
                      <div><span className="font-medium">Tutor Docente:</span> {convenioData?.facultad_docente_tutor_nombre}</div>
                      <div><span className="font-medium">Firma:</span> {convenioData?.dia} de {convenioData?.mes}</div>
                    </div>
                    <div><span className="font-medium">Temática:</span> {convenioData?.practica_tematica}</div>
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
                  Confirmo que toda la información es correcta y deseo crear el convenio
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
            {currentStep === 3 && (
              <Button
                type="submit"
                variant="default"
                disabled={Object.values(form.formState.errors).length > 0 || isSubmitting}
                className="px-4 transition-all"
              >
                Siguiente <ChevronRightIcon className="h-4 w-4 ml-1" />
              </Button>
            )}
            {currentStep === 4 && (
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
                    Guardar y Enviar convenio
                  </Button>
                )}
                {showConfirmModal && (
                  <Modal onClose={() => setShowConfirmModal(false)}>
                    <div className="p-6">
                      <h2 className="text-lg font-semibold mb-4">Confirmar envío</h2>
                      <p className="mb-6">¿Deseas enviar este convenio particular? Una vez enviado no podrás volver a modificarlo.</p>
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
            {currentStep < 3 && (
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
        title="¡Convenio Particular Enviado!"
        message="Tu convenio particular ha sido enviado exitosamente."
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
