
"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { 
  UploadCloudIcon, 
  FileTextIcon, 
  Loader2Icon, 
  CheckCircleIcon, 
  AlertCircleIcon,
  ArrowRightIcon,
  SettingsIcon
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/utils/cn";
import { useToast } from "@/shared/components/ui/toast";
import { FormSchema } from "@/shared/types/dynamic-form";
import { SchemaEditor } from "./SchemaEditor";

export function TemplateManagerClient() {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [draftSchema, setDraftSchema] = useState<FormSchema | null>(null);
  const [previewText, setPreviewText] = useState<string>("");
  const [step, setStep] = useState<"upload" | "refine" | "success">("upload");
  const toast = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1
  });

  const handleAnalyze = async () => {
    if (!file) return;
    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/templates/analyze", {
        method: "POST",
        body: formData
      });

      if (!response.ok) throw new Error("Error analizando el archivo");

      const data = await response.json();
      setDraftSchema(data.schema);
      setPreviewText(data.preview);
      setStep("refine");
      toast.success("Análisis completado", "Se han detectado los campos de la plantilla.");

    } catch (error) {
      console.error(error);
      toast.error("Error", "No se pudo analizar la plantilla.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePublish = async (finalSchema: FormSchema, name: string, slug: string, previewText: string) => {
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("slug", slug);
      formData.append("schema", JSON.stringify(finalSchema));
      formData.append("template_content", previewText); // Enviamos el contenido extraído
      if (file) {
        formData.append("file", file);
      }

      const response = await fetch("/api/admin/forms", {
        method: "POST",
        body: formData
      });

      if (!response.ok) throw new Error("Error publicando el formulario");

      setStep("success");
      toast.success("¡Publicado!", "El nuevo formulario ya está disponible para los usuarios.");

    } catch (error) {
      console.error(error);
      toast.error("Error", "No se pudo publicar el formulario.");
    }
  };

  const reset = () => {
    setFile(null);
    setDraftSchema(null);
    setStep("upload");
  };

  return (
    <div className="space-y-8">
      {/* Stepper Visual */}
      <div className="flex items-center justify-center mb-8">
        <div className={cn("flex items-center gap-2", step === "upload" ? "text-primary" : "text-muted-foreground")}>
          <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold">1</div>
          <span>Subir Plantilla</span>
        </div>
        <div className="w-16 h-0.5 bg-border mx-4" />
        <div className={cn("flex items-center gap-2", step === "refine" ? "text-primary" : "text-muted-foreground")}>
          <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold">2</div>
          <span>Refinar Campos</span>
        </div>
        <div className="w-16 h-0.5 bg-border mx-4" />
        <div className={cn("flex items-center gap-2", step === "success" ? "text-green-500" : "text-muted-foreground")}>
          <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold">3</div>
          <span>Publicado</span>
        </div>
      </div>

      {step === "upload" && (
        <div className="max-w-xl mx-auto">
          <div 
            {...getRootProps()} 
            className={cn(
              "border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200",
              isDragActive ? "border-primary bg-primary/5 scale-105" : "border-border hover:border-primary/50 hover:bg-card/50",
              file ? "bg-green-500/5 border-green-500/50" : ""
            )}
          >
            <input {...getInputProps()} />
            
            {file ? (
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                  <FileTextIcon className="w-8 h-8" />
                </div>
                <div>
                  <p className="font-medium text-lg">{file.name}</p>
                  <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                </div>
                <Button 
                  onClick={(e) => { e.stopPropagation(); handleAnalyze(); }} 
                  disabled={isAnalyzing}
                  className="mt-4"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                      Analizando...
                    </>
                  ) : (
                    <>
                      Analizar Plantilla
                      <ArrowRightIcon className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 text-muted-foreground">
                <UploadCloudIcon className="w-16 h-16 opacity-50" />
                <div>
                  <p className="font-medium text-lg text-foreground">Arrastra tu plantilla .docx aquí</p>
                  <p className="text-sm">o haz clic para seleccionar</p>
                </div>
                <p className="text-xs max-w-xs mx-auto opacity-70">
                  El sistema detectará automáticamente las variables entre llaves como {'{nombre_variable}'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {step === "refine" && draftSchema && (
        <SchemaEditor 
          initialSchema={draftSchema} 
          previewText={previewText}
          onPublish={handlePublish}
          onCancel={reset}
        />
      )}

      {step === "success" && (
        <div className="text-center py-12 space-y-6 animate-in fade-in zoom-in duration-500">
          <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircleIcon className="w-12 h-12" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">¡Formulario Publicado!</h2>
            <p className="text-muted-foreground max-w-md mx-auto mt-2">
              La plantilla ha sido procesada y el formulario ya está disponible para ser utilizado por los usuarios.
            </p>
          </div>
          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={reset}>
              Subir otra plantilla
            </Button>
            <Button onClick={() => window.location.href = '/protected'}>
              Ir al Dashboard
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
