"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  Form,
} from "@/app/components/ui/form";
import { BuildingIcon, UserIcon, FileTextIcon, CheckIcon, ChevronLeftIcon, ChevronRightIcon, MaximizeIcon, XIcon, UploadIcon } from "lucide-react";
import { useConvenioMarcoStore } from "@/stores/convenioMarcoStore";
import { Modal } from '@/app/components/ui/modal';
import { SuccessModal } from '@/app/components/ui/success-modal';
import dynamic from 'next/dynamic';

// Importar React Quill dinámicamente para evitar problemas de SSR
const ReactQuill = dynamic(() => import('react-quill'), { 
  ssr: false,
  loading: () => <div className="h-32 border border-border rounded-md bg-background animate-pulse" />
});
import 'react-quill/dist/quill.snow.css';

// Estilos personalizados para el editor Quill
const quillStyles = `
  .ql-editor {
    min-height: 250px;
    font-family: inherit;
    color: #000000 !important;
    background-color: #ffffff !important;
  }
  .ql-editor img {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
    margin: 8px 0;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  .ql-toolbar {
    border-color: #d1d5db !important;
    background: #f9fafb !important;
    border-bottom: 1px solid #d1d5db !important;
    display: block !important;
    visibility: visible !important;
  }
  .ql-container {
    border-color: #d1d5db;
    background: #ffffff;
  }
  .ql-editor.ql-blank::before {
    color: #9ca3af;
    font-style: italic;
  }
  .ql-snow .ql-picker {
    color: #374151;
  }
  .ql-snow .ql-stroke {
    stroke: #374151;
  }
  .ql-snow .ql-fill {
    fill: #374151;
  }
  .ql-snow .ql-picker-options {
    background: #ffffff;
    border: 1px solid #d1d5db;
  }
  .ql-snow .ql-picker-item:hover {
    background: #f3f4f6;
  }
  .ql-fullscreen-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1000;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }
  .ql-fullscreen-container {
    width: 100%;
    max-width: 1200px;
    height: 90vh;
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  }
  .ql-fullscreen-header {
    padding: 16px 20px;
    background: #f9fafb;
    border-bottom: 1px solid #d1d5db;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .ql-fullscreen-editor .ql-editor {
    min-height: calc(90vh - 140px);
    font-size: 14px;
    line-height: 1.6;
  }
`;

// Esquemas de validación
const entidadSchema = z.object({
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  domicilio: z.string().min(5, "La dirección debe tener al menos 5 caracteres"),
  cuit: z.string().min(11, "El CUIT es obligatorio y debe tener al menos 11 dígitos"),
});

const representanteSchema = z.object({
  representanteNombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  cargoRepresentante: z.string().min(2, "El cargo debe tener al menos 2 caracteres"),
  representanteDni: z.string().min(7, "El DNI debe tener al menos 7 dígitos").max(8, "El DNI no puede tener más de 8 dígitos"),
});

const detallesSchema = z.object({
  convenioMarcoFecha: z.string().min(1, "La fecha del convenio marco es requerida"),
  convenioEspecificoTipo: z.string().min(2, "El tipo de convenio específico es requerido"),
  unidadEjecutoraFacultad: z.string().min(2, "La unidad ejecutora de la facultad es requerida"),
  unidadEjecutoraEntidad: z.string().min(2, "La unidad ejecutora de la entidad es requerida"),
  dia: z.string().min(1, "El día es requerido"),
  mes: z.string().min(1, "El mes es requerido"),
  anexo: z.string().optional(),
});

const quillModules = {
  toolbar: [
    [{ 'header': ['1', '2', '3', '4', '5', '6', false] }],
    [{ 'font': [] }],
    [{ 'size': ['small', false, 'large', 'huge'] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'script': 'sub'}, { 'script': 'super' }],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' }],
    [{ 'indent': '-1'}, { 'indent': '+1' }],
    [{ 'align': [] }],
    ['blockquote', 'code-block'],
    ['link', 'image'],
    ['clean']
  ],
  clipboard: {
    matchVisual: true,
  }
};

const quillFormats = [
  'header', 'font', 'size',
  'bold', 'italic', 'underline', 'strike', 
  'script', 'color', 'background',
  'list', 'bullet', 'check', 'indent',
  'align', 'blockquote', 'code-block',
  'link', 'image', 'width', 'height'
];

const meses = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];
const diasPorMes = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

interface ConvenioEspecificoFormProps {
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

export default function ConvenioEspecificoForm({
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
}: ConvenioEspecificoFormProps) {
  const router = useRouter();
  const { updateConvenioData, convenioData } = useConvenioMarcoStore();
  const [validationSchema, setValidationSchema] = useState<z.ZodTypeAny>(entidadSchema);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenContent, setFullscreenContent] = useState("");
  
  // Estado local para anexos (se sincroniza con el store al enviar paso 3)
  const [anexoFiles, setAnexoFiles] = useState<Array<{id: string, name: string, file: File, buffer: ArrayBuffer}>>([]);
  const [anexoMode, setAnexoMode] = useState<'editor' | 'files' | null>(null);

  // Cargar estado inicial de anexos desde el store si existe
  useEffect(() => {
    if (convenioData?.anexosMultiples) {
      setAnexoFiles(convenioData.anexosMultiples);
    }
    if (convenioData?.anexoMode) {
      setAnexoMode(convenioData.anexoMode);
    }
  }, [convenioData]);

  useEffect(() => {
    switch (currentStep) {
      case 1:
        setValidationSchema(entidadSchema);
        break;
      case 2:
        setValidationSchema(representanteSchema);
        break;
      case 3:
        setValidationSchema(detallesSchema);
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
          nombre: convenioData?.entidad_nombre || '',
          domicilio: convenioData?.entidad_domicilio || '',
          cuit: convenioData?.entidad_cuit || ''
        };
      case 2:
        return {
          representanteNombre: convenioData?.entidad_representante || '',
          cargoRepresentante: convenioData?.entidad_cargo || '',
          representanteDni: convenioData?.entidad_dni || ''
        };
      case 3:
        return {
          convenioMarcoFecha: convenioData?.convenio_marco_fecha || '',
          convenioEspecificoTipo: convenioData?.convenio_especifico_tipo || '',
          unidadEjecutoraFacultad: convenioData?.unidad_ejecutora_facultad || '',
          unidadEjecutoraEntidad: convenioData?.unidad_ejecutora_entidad || '',
          dia: convenioData?.dia || '',
          mes: convenioData?.mes || '',
          anexo: convenioData?.anexo || '',
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
      
      switch(currentStep) {
        case 1:
          updateConvenioData('all', {
            ...convenioData,
            entidad_nombre: data.nombre,
            entidad_domicilio: data.domicilio,
            entidad_cuit: data.cuit
          });
          break;
        case 2:
          updateConvenioData('all', {
            ...convenioData,
            entidad_representante: data.representanteNombre,
            entidad_cargo: data.cargoRepresentante,
            entidad_dni: data.representanteDni
          });
          break;
        case 3:
          updateConvenioData('all', {
            ...convenioData,
            convenio_marco_fecha: data.convenioMarcoFecha || '',
            convenio_especifico_tipo: data.convenioEspecificoTipo || '',
            unidad_ejecutora_facultad: data.unidadEjecutoraFacultad || '',
            unidad_ejecutora_entidad: data.unidadEjecutoraEntidad || '',
            dia: data.dia || '',
            mes: data.mes || '',
            anexo: data.anexo || '',
            anexosMultiples: anexoFiles,
            anexoMode: anexoMode,
          });
          break;
      }
      
      if (currentStep < 4) {
        onStepChange(currentStep + 1);
      }
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Error inesperado');
    }
  };

  // Funciones para anexos
  const handleMultipleAnexosUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setAnexoMode('files');
    form.setValue("anexo", "");

    for (let file of Array.from(files)) {
      if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        try {
          const buffer = await file.arrayBuffer();
          const anexo = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            name: file.name,
            file: file,
            buffer: buffer
          };
          setAnexoFiles(prev => [...prev, anexo]);
        } catch (error) {
          console.error('Error procesando archivo:', file.name, error);
          alert(`Error procesando ${file.name}: ${error}`);
        }
      } else {
        alert(`${file.name} no es un archivo .docx válido`);
      }
    }
    event.target.value = '';
  };

  const removeAnexoFile = (anexoId: string) => {
    setAnexoFiles(prev => prev.filter(a => a.id !== anexoId));
    if (anexoFiles.length <= 1) {
      setAnexoMode(null);
    }
  };

  const switchToEditorMode = () => {
    setAnexoMode('editor');
    setAnexoFiles([]);
  };

  const openFullscreen = () => {
    setFullscreenContent(form.watch("anexo") || "");
    setIsFullscreen(true);
  };

  const closeFullscreen = () => {
    form.setValue("anexo", fullscreenContent);
    setIsFullscreen(false);
  };

  const FullscreenEditor = () => {
    if (!isFullscreen) return null;
    return (
      <div className="ql-fullscreen-modal" onClick={closeFullscreen}>
        <div className="ql-fullscreen-container" onClick={(e) => e.stopPropagation()}>
          <div className="ql-fullscreen-header">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Editor de Anexo - Pantalla Completa</h3>
              <p className="text-sm text-gray-600">Copia y pega contenido desde Word/Google Docs con formato completo</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={closeFullscreen}
              className="ml-4"
            >
              <XIcon className="h-4 w-4 mr-2" />
              Cerrar
            </Button>
          </div>
          <div className="ql-fullscreen-editor">
            <style dangerouslySetInnerHTML={{ __html: quillStyles }} />
            <ReactQuill
              value={fullscreenContent}
              onChange={setFullscreenContent}
              modules={quillModules}
              formats={quillFormats}
              placeholder="Pegue aquí el contenido del anexo..."
              style={{
                height: 'calc(90vh - 140px)',
                backgroundColor: '#ffffff',
              }}
              theme="snow"
            />
          </div>
        </div>
      </div>
    );
  };

  const renderStepContent = () => {
    switch(currentStep) {
      case 1:
        return (
          <div className="space-y-6 animate-in fade-in-0">
            <div className="space-y-2 mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <div className="p-1.5 rounded-full bg-orange-500/20 text-orange-600">
                  <BuildingIcon className="h-5 w-5" />
                </div>
                Datos de la Entidad
              </h2>
              <p className="text-sm text-muted-foreground">
                Información básica de la empresa u organización.
              </p>
            </div>

            <div className="border border-border rounded-lg p-5 bg-card space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre de la Entidad *</Label>
                  <Input
                    id="nombre"
                    className="border-border focus-visible:ring-primary"
                    {...form.register("nombre")}
                  />
                  {form.formState.errors.nombre?.message && (
                    <p className="text-sm text-red-500">{String(form.formState.errors.nombre.message)}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="domicilio">Domicilio *</Label>
                  <Input
                    id="domicilio"
                    className="border-border focus-visible:ring-primary"
                    {...form.register("domicilio")}
                  />
                  {form.formState.errors.domicilio?.message && (
                    <p className="text-sm text-red-500">{String(form.formState.errors.domicilio.message)}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cuit">CUIT *</Label>
                  <Input
                    id="cuit"
                    className="border-border focus-visible:ring-primary"
                    {...form.register("cuit")}
                  />
                  {form.formState.errors.cuit?.message && (
                    <p className="text-sm text-red-500">{String(form.formState.errors.cuit.message)}</p>
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
                <div className="p-1.5 rounded-full bg-teal-500/20 text-teal-600">
                  <UserIcon className="h-5 w-5" />
                </div>
                Datos del Representante
              </h2>
              <p className="text-sm text-muted-foreground">
                Información del representante legal.
              </p>
            </div>

            <div className="border border-border rounded-lg p-5 bg-card space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="representanteNombre">Nombre del Representante *</Label>
                  <Input
                    id="representanteNombre"
                    className="border-border focus-visible:ring-primary"
                    {...form.register("representanteNombre")}
                  />
                  {form.formState.errors.representanteNombre?.message && (
                    <p className="text-sm text-red-500">{String(form.formState.errors.representanteNombre.message)}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cargoRepresentante">Cargo *</Label>
                  <Input
                    id="cargoRepresentante"
                    className="border-border focus-visible:ring-primary"
                    {...form.register("cargoRepresentante")}
                  />
                  {form.formState.errors.cargoRepresentante?.message && (
                    <p className="text-sm text-red-500">{String(form.formState.errors.cargoRepresentante.message)}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="representanteDni">DNI *</Label>
                  <Input
                    id="representanteDni"
                    className="border-border focus-visible:ring-primary"
                    {...form.register("representanteDni")}
                  />
                  {form.formState.errors.representanteDni?.message && (
                    <p className="text-sm text-red-500">{String(form.formState.errors.representanteDni.message)}</p>
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
                <div className="p-1.5 rounded-full bg-orange-500/20 text-orange-600">
                  <FileTextIcon className="h-5 w-5" />
                </div>
                Detalles del Convenio
              </h2>
              <p className="text-sm text-muted-foreground">
                Información específica del convenio y anexos.
              </p>
            </div>

            <div className="border border-border rounded-lg p-5 bg-card space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="convenioMarcoFecha">Fecha del Convenio Marco *</Label>
                  <Input
                    id="convenioMarcoFecha"
                    type="date"
                    className="border-border focus-visible:ring-primary"
                    {...form.register("convenioMarcoFecha")}
                  />
                  {form.formState.errors.convenioMarcoFecha?.message && (
                    <p className="text-sm text-red-500">{String(form.formState.errors.convenioMarcoFecha.message)}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="convenioEspecificoTipo">Tipo de Convenio Específico *</Label>
                  <Input
                    id="convenioEspecificoTipo"
                    className="border-border focus-visible:ring-primary"
                    {...form.register("convenioEspecificoTipo")}
                  />
                  {form.formState.errors.convenioEspecificoTipo?.message && (
                    <p className="text-sm text-red-500">{String(form.formState.errors.convenioEspecificoTipo.message)}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unidadEjecutoraFacultad">Unidad Ejecutora Facultad *</Label>
                  <Input
                    id="unidadEjecutoraFacultad"
                    className="border-border focus-visible:ring-primary"
                    {...form.register("unidadEjecutoraFacultad")}
                  />
                  {form.formState.errors.unidadEjecutoraFacultad?.message && (
                    <p className="text-sm text-red-500">{String(form.formState.errors.unidadEjecutoraFacultad.message)}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unidadEjecutoraEntidad">Unidad Ejecutora Entidad *</Label>
                  <Input
                    id="unidadEjecutoraEntidad"
                    className="border-border focus-visible:ring-primary"
                    {...form.register("unidadEjecutoraEntidad")}
                  />
                  {form.formState.errors.unidadEjecutoraEntidad?.message && (
                    <p className="text-sm text-red-500">{String(form.formState.errors.unidadEjecutoraEntidad.message)}</p>
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
                <div className="space-y-2">
                  <Label htmlFor="dia">Día de Firma *</Label>
                  <select
                    id="dia"
                    className="border border-border focus-visible:ring-2 focus-visible:ring-primary rounded-md w-full h-10 px-3 bg-card"
                    {...form.register("dia", { required: true })}
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

                {/* Sección de Anexos */}
                <div className="space-y-2 md:col-span-2">
                  <div className="space-y-4">
                    <Label htmlFor="anexo">Anexo (Opcional)</Label>
                    
                    {/* Opción 1: Editor de texto */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium">📝 Opción 1: Editor de texto</span>
                          {anexoMode === 'files' && (
                            <span className="text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded dark:bg-amber-900/20 dark:text-amber-400">
                              Deshabilitado (archivos seleccionados)
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {anexoMode === 'files' && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={switchToEditorMode}
                              className="text-xs px-2 py-1 h-6"
                            >
                              Cambiar a editor
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={openFullscreen}
                            disabled={anexoMode === 'files'}
                            className="text-xs px-2 py-1 h-6"
                          >
                            <MaximizeIcon className="h-3 w-3 mr-1" />
                            Pantalla completa
                          </Button>
                        </div>
                      </div>
                      
                      <div className="border border-border rounded-md overflow-hidden relative">
                        {anexoMode === 'files' && (
                          <div className="absolute inset-0 bg-zinc-200 bg-opacity-80 z-10 flex flex-col items-center justify-center dark:bg-zinc-800 dark:bg-opacity-80">
                            <span className="text-zinc-700 font-semibold text-sm dark:text-zinc-300">Editor deshabilitado</span>
                            <span className="text-xs text-zinc-500 dark:text-zinc-400">Tienes archivos anexo seleccionados</span>
                          </div>
                        )}
                        <style dangerouslySetInnerHTML={{ __html: quillStyles }} />
                        <ReactQuill
                          value={form.watch("anexo") || ""}
                          onChange={(content: string) => {
                            if (anexoMode !== 'files') {
                              form.setValue("anexo", content);
                              if (content.trim() && anexoMode !== 'editor') {
                                setAnexoMode('editor');
                              }
                            }
                          }}
                          modules={quillModules}
                          formats={quillFormats}
                          placeholder="Pegue aquí el contenido del anexo..."
                          style={{
                            height: '300px',
                            backgroundColor: '#ffffff',
                            pointerEvents: anexoMode === 'files' ? 'none' : 'auto',
                            opacity: anexoMode === 'files' ? 0.5 : 1
                          }}
                          readOnly={anexoMode === 'files'}
                          theme="snow"
                        />
                      </div>
                    </div>

                    {/* Opción 2: Múltiples archivos Word */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium">📄 Opción 2: Múltiples documentos Word</span>
                          {anexoMode === 'editor' && (
                            <span className="text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded dark:bg-amber-900/20 dark:text-amber-400">
                              Deshabilitado (editor en uso)
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="file"
                            id="multiple-word-upload"
                            accept=".docx"
                            multiple
                            onChange={handleMultipleAnexosUpload}
                            className="hidden"
                            disabled={anexoMode === 'editor'}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById('multiple-word-upload')?.click()}
                            disabled={anexoMode === 'editor'}
                            className="text-xs px-2 py-1 h-6"
                          >
                            <UploadIcon className="h-3 w-3 mr-1" />
                            Adjuntar .docx
                          </Button>
                        </div>
                      </div>
                      
                      {anexoFiles.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-muted-foreground">
                            Anexos agregados ({anexoFiles.length}):
                          </h4>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {anexoFiles.map((anexo) => (
                              <div key={anexo.id} className="flex items-center justify-between p-3 bg-blue-500/10 border border-blue-500/20 rounded-md dark:bg-blue-500/10 dark:border-blue-500/20">
                                <div className="flex items-center gap-3">
                                  <FileTextIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                  <div>
                                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">{anexo.name}</p>
                                    <p className="text-xs text-blue-600 dark:text-blue-300">
                                      {(anexo.file.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeAnexoFile(anexo.id)}
                                  className="text-xs px-2 py-1 h-7 text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-900/20"
                                >
                                  <XIcon className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
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
                <div className="p-1.5 rounded-full bg-blue-500/20 text-blue-600">
                  <CheckIcon className="h-5 w-5" />
                </div>
                Revisión y Finalización
              </h2>
              <p className="text-sm text-muted-foreground">
                Revisa toda la información antes de crear el convenio específico.
              </p>
            </div>

            <div className="space-y-6">
              {/* Datos de la Entidad */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-orange-500/10 to-orange-600/10 rounded-xl blur-xl"></div>
                <div className="relative bg-card/80 backdrop-blur-xl border border-border/60 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-orange-600 mb-4 flex items-center gap-2">
                    <BuildingIcon className="h-5 w-5" />
                    Datos de la Entidad
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><span className="font-medium">Entidad:</span> {convenioData?.entidad_nombre}</div>
                    <div><span className="font-medium">Domicilio:</span> {convenioData?.entidad_domicilio}</div>
                    <div><span className="font-medium">CUIT:</span> {convenioData?.entidad_cuit}</div>
                  </div>
                </div>
              </div>

              {/* Datos del Representante */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-purple-500/10 to-purple-600/10 rounded-xl blur-xl"></div>
                <div className="relative bg-card/80 backdrop-blur-xl border border-border/60 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-teal-600 mb-4 flex items-center gap-2">
                    <UserIcon className="h-5 w-5" />
                    Datos del Representante
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><span className="font-medium">Representante:</span> {convenioData?.entidad_representante}</div>
                    <div><span className="font-medium">Cargo:</span> {convenioData?.entidad_cargo}</div>
                    <div><span className="font-medium">DNI:</span> {convenioData?.entidad_dni}</div>
                  </div>
                </div>
              </div>

              {/* Detalles del Convenio */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-purple-600/10 rounded-xl blur-xl"></div>
                <div className="relative bg-card/80 backdrop-blur-xl border border-border/60 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-indigo-600 mb-4 flex items-center gap-2">
                    <FileTextIcon className="h-5 w-5" />
                    Detalles del Convenio
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><span className="font-medium">Fecha convenio marco:</span> {convenioData?.convenio_marco_fecha}</div>
                    <div><span className="font-medium">Tipo específico:</span> {convenioData?.convenio_especifico_tipo}</div>
                    <div><span className="font-medium">Unidad ejecutora facultad:</span> {convenioData?.unidad_ejecutora_facultad}</div>
                    <div><span className="font-medium">Unidad ejecutora entidad:</span> {convenioData?.unidad_ejecutora_entidad}</div>
                    <div><span className="font-medium">Día de firma:</span> {convenioData?.dia}</div>
                    <div><span className="font-medium">Mes de firma:</span> {convenioData?.mes}</div>
                  </div>
                </div>
              </div>

              {/* Anexo */}
              {convenioData?.anexo && (
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-purple-500/10 to-purple-600/10 rounded-xl blur-xl"></div>
                  <div className="relative bg-card/80 backdrop-blur-xl border border-border/60 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-purple-600 mb-4 flex items-center gap-2">
                      <FileTextIcon className="h-5 w-5" />
                      Anexo
                    </h3>
                    <div 
                      className="prose prose-sm max-w-none text-sm"
                      dangerouslySetInnerHTML={{ __html: convenioData.anexo }}
                    />
                  </div>
                </div>
              )}

              {/* Anexos múltiples */}
              {anexoFiles.length > 0 && (
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-purple-500/10 to-purple-600/10 rounded-xl blur-xl"></div>
                  <div className="relative bg-card/80 backdrop-blur-xl border border-border/60 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-purple-600 mb-4 flex items-center gap-2">
                      <FileTextIcon className="h-5 w-5" />
                      Anexos Múltiples ({anexoFiles.length})
                    </h3>
                    <div className="space-y-2">
                      {anexoFiles.map((anexo, index) => (
                        <div key={anexo.id} className="flex items-center gap-3 text-sm p-3 bg-purple-50 dark:bg-purple-900/20 rounded border border-purple-200 dark:border-purple-700">
                          <span className="font-mono text-purple-700 dark:text-purple-300 w-8">#{index + 1}</span>
                          <FileTextIcon className="h-4 w-4 text-purple-500" />
                          <div className="flex-1">
                            <span className="font-medium text-purple-800 dark:text-purple-200">{anexo.name}</span>
                            <div className="text-xs text-purple-600 dark:text-purple-300">
                              {(anexo.file.size / 1024 / 1024).toFixed(2)} MB
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
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
                      <p className="mb-6">¿Deseas enviar este convenio específico? Una vez enviado no podrás volver a modificarlo.</p>
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
      
      <FullscreenEditor />

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="¡Convenio Específico Enviado!"
        message="Tu convenio específico ha sido enviado exitosamente."
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