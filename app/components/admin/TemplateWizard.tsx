"use client";

import { useState, useEffect } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Upload, FileText, Check, ArrowRight, Loader2, Trash2, ArrowLeft, SparklesIcon, PencilIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/shared/components/ui/toast";
import { FormSchema, FormField } from "@/lib/types/dynamic-form";
import { HorizontalStepper } from "@/app/components/forms/HorizontalStepper";
import { useRouter } from "next/navigation";
import { Badge } from "@/shared/components/ui/badge";
import { FieldEditor } from "./FieldEditor";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog";

interface TemplateWizardProps {
    initialData?: {
        id: string;
        name: string;
        description: string;
        schema: FormSchema;
    };
    isEditMode?: boolean;
}

export function TemplateWizard({ initialData, isEditMode = false }: TemplateWizardProps) {
    const [step, setStep] = useState(1);
    const [file, setFile] = useState<File | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [schema, setSchema] = useState<FormSchema | null>(initialData?.schema || null);
    const [templateName, setTemplateName] = useState(initialData?.name || "");
    const [templateDescription, setTemplateDescription] = useState(initialData?.description || "");
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [editingField, setEditingField] = useState<FormField | null>(null);
    const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null);
    const { success, error } = useToast();
    const router = useRouter();

    useEffect(() => {
        if (isEditMode && initialData) {
            setStep(2);
        }
    }, [isEditMode, initialData]);

    const handleFieldUpdate = (updatedField: FormField) => {
        if (!schema || editingStepIndex === null) return;

        setSchema(prevSchema => {
            if (!prevSchema) return prevSchema;
            const newSteps = [...prevSchema.steps];
            const stepToUpdate = { ...newSteps[editingStepIndex] };
            stepToUpdate.fields = stepToUpdate.fields.map(f =>
                f.name === updatedField.name ? updatedField : f
            );
            newSteps[editingStepIndex] = stepToUpdate;
            return { ...prevSchema, steps: newSteps };
        });

        setEditingField(null);
        setEditingStepIndex(null);
    };

    const openFieldEditor = (field: FormField, stepIndex: number) => {
        setEditingField(field);
        setEditingStepIndex(stepIndex);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleAnalyze = async () => {
        if (!file) return;

        setIsAnalyzing(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("/api/admin/templates/analyze", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) throw new Error("Error en el análisis");

            const data = await response.json();
            setSchema(data.schema);
            setStep(2);
            success("Análisis Completado", "Se han detectado las variables y estructura del documento.");
        } catch (err) {
            console.error(err);
            error("Error", "No se pudo analizar el archivo. Asegúrate de que es un .docx válido.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSave = async () => {
        if (!schema || !templateName) return;
        setIsSaving(true);

        try {
            let templateContent = null;
            if (file) {
                // Convert file to base64
                const reader = new FileReader();
                templateContent = await new Promise((resolve, reject) => {
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
            }

            const url = isEditMode && initialData
                ? `/api/admin/templates/${initialData.id}`
                : "/api/admin/templates";

            const method = isEditMode ? "PUT" : "POST";

            const body: any = {
                name: templateName,
                description: templateDescription,
                schema: schema
            };

            if (templateContent) {
                body.template_content = templateContent;
            }

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            if (!response.ok) throw new Error("Error al guardar");

            success(
                isEditMode ? "¡Plantilla Actualizada!" : "¡Plantilla Creada!",
                isEditMode ? "Los cambios se han guardado correctamente." : "El modelo se ha guardado exitosamente."
            );

            router.push("/protected/admin/plantillas");
            router.refresh();

        } catch (err) {
            error("Error", "No se pudo guardar la plantilla.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!initialData?.id) return;
        setIsDeleting(true);

        try {
            const response = await fetch(`/api/admin/templates/${initialData.id}`, {
                method: "DELETE"
            });

            if (!response.ok) throw new Error("Error al eliminar");

            success("Plantilla Eliminada", "La plantilla ha sido eliminada correctamente.");
            router.push("/protected/admin/plantillas");
            router.refresh();
        } catch (err) {
            error("Error", "No se pudo eliminar la plantilla.");
            setIsDeleting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-up">
            <div className="mb-6">
                <Button
                    variant="ghost"
                    className="pl-0 hover:pl-2 transition-all text-muted-foreground hover:text-foreground"
                    onClick={() => router.push("/protected/admin/plantillas")}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver al listado
                </Button>
            </div>

            {/* Wizard Steps */}
            <div className="mb-8 flex justify-center">
                <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
                    <div className={`flex items-center gap-2 ${step >= 1 ? "text-primary" : ""}`}>
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${step >= 1 ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/25" : "border-muted-foreground/30"}`}>1</span>
                        <span className={step >= 1 ? "font-semibold text-foreground" : ""}>Subir Plantilla</span>
                    </div>
                    <div className={`w-16 h-[2px] rounded-full transition-colors ${step >= 2 ? "bg-primary" : "bg-border"}`} />
                    <div className={`flex items-center gap-2 ${step >= 2 ? "text-primary" : ""}`}>
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${step >= 2 ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/25" : "border-muted-foreground/30"}`}>2</span>
                        <span className={step >= 2 ? "font-semibold text-foreground" : ""}>Configuración</span>
                    </div>
                </div>
            </div>

            <Card className="border border-white/10 bg-card/40 backdrop-blur-md shadow-xl min-h-[400px]">
                <CardContent className="p-8">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="flex flex-col items-center justify-center space-y-6 py-8"
                            >
                                <div
                                    className={`w-full max-w-xl h-72 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${file ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/50 hover:bg-muted/5"}`}
                                    onClick={() => document.getElementById('file-upload')?.click()}
                                >
                                    <input
                                        id="file-upload"
                                        type="file"
                                        accept=".docx"
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                    {file ? (
                                        <div className="text-center animate-in fade-in zoom-in duration-300">
                                            <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                <FileText className="w-10 h-10 text-primary" />
                                            </div>
                                            <p className="font-semibold text-xl">{file.name}</p>
                                            <Badge variant="secondary" className="mt-2">
                                                {(file.size / 1024).toFixed(2)} KB
                                            </Badge>
                                        </div>
                                    ) : (
                                        <div className="text-center p-6">
                                            <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                                                <Upload className="w-8 h-8 text-muted-foreground" />
                                            </div>
                                            <h3 className="text-xl font-semibold mb-2">
                                                {isEditMode ? "Reemplazar Plantilla .docx" : "Sube tu documento"}
                                            </h3>
                                            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                                                Arrastra tu archivo aquí o haz clic para explorar.
                                            </p>
                                            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground bg-muted/30 py-2 px-4 rounded-full">
                                                <SparklesIcon className="w-3 h-3 text-amber-500" />
                                                Detectaremos las variables {'{entre_llaves}'} automáticamente
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-4 w-full max-w-xl">
                                    {isEditMode && (
                                        <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>
                                            Saltar Subida
                                        </Button>
                                    )}
                                    <Button
                                        size="lg"
                                        disabled={!file || isAnalyzing}
                                        onClick={handleAnalyze}
                                        className="flex-1 shadow-lg shadow-primary/20"
                                    >
                                        {isAnalyzing ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Analizando estructura...
                                            </>
                                        ) : (
                                            <>
                                                Continuar
                                                <ArrowRight className="w-4 h-4 ml-2" />
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && schema && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-8"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label>Nombre del Modelo</Label>
                                        <Input
                                            value={templateName}
                                            onChange={(e) => setTemplateName(e.target.value)}
                                            placeholder="Ej: Convenio de Pasantía"
                                            className="bg-background/50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Descripción Corta</Label>
                                        <Input
                                            value={templateDescription}
                                            onChange={(e) => setTemplateDescription(e.target.value)}
                                            placeholder="Ej: Para alumnos de ingeniería..."
                                            className="bg-background/50"
                                        />
                                    </div>
                                </div>

                                <div className="bg-muted/10 rounded-xl p-6 border border-border/50">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-semibold flex items-center gap-2">
                                            <div className="p-1.5 bg-green-500/10 rounded-lg">
                                                <Check className="w-4 h-4 text-green-500" />
                                            </div>
                                            Estructura Detectada
                                        </h3>
                                        <Badge variant="outline" className="text-xs font-mono">
                                            {schema.steps.reduce((acc, s) => acc + s.fields.length, 0)} Campos
                                        </Badge>
                                    </div>

                                    {/* Reusing the Horizontal Stepper for preview */}
                                    <div className="pointer-events-none opacity-80 scale-95 origin-top-left w-full mb-6">
                                        <HorizontalStepper steps={schema.steps} currentStep={1} />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {schema.steps.map((stepItem, stepIndex) => (
                                            <div key={stepItem.id} className="p-4 bg-card/50 rounded-xl border border-border/50 flex flex-col h-full hover:border-primary/20 transition-colors">
                                                <h4 className="font-medium text-primary mb-3 flex items-center gap-2 pb-2 border-b border-border/50">
                                                    <span className="text-xs bg-primary/10 px-2 py-0.5 rounded-md font-bold text-primary">{stepItem.fields.length}</span>
                                                    {stepItem.title}
                                                </h4>
                                                <div className="flex-1 max-h-[150px] overflow-y-auto pr-2 space-y-1 custom-scrollbar">
                                                    {stepItem.fields.map(f => (
                                                        <button
                                                            key={f.name}
                                                            onClick={() => openFieldEditor(f, stepIndex)}
                                                            className="w-full text-left text-sm flex items-center gap-2 group p-1.5 rounded-md hover:bg-primary/10 transition-colors"
                                                        >
                                                            <PencilIcon className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                                                            <span className="text-muted-foreground group-hover:text-foreground transition-colors text-xs truncate">
                                                                {f.label}
                                                            </span>
                                                            <Badge variant="outline" className="ml-auto text-[10px] px-1.5 py-0 opacity-60 group-hover:opacity-100">
                                                                {f.type}
                                                            </Badge>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Field Editor Modal */}
                                    {editingField && (
                                        <FieldEditor
                                            field={editingField}
                                            onSave={handleFieldUpdate}
                                            open={!!editingField}
                                            onOpenChange={(open) => !open && setEditingField(null)}
                                        />
                                    )}
                                </div>

                                <div className="flex justify-between pt-4 items-center border-t border-border/50">
                                    <Button variant="ghost" onClick={() => setStep(1)}>
                                        Atrás
                                    </Button>

                                    <div className="flex gap-2">
                                        {isEditMode && (
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="destructive" disabled={isDeleting}>
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        Eliminar
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Esta acción no se puede deshacer. Se eliminará permanentemente la plantilla y todos los datos asociados.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                                            {isDeleting ? "Eliminando..." : "Sí, eliminar"}
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        )}

                                        <Button onClick={handleSave} disabled={isSaving || !templateName} className="shadow-lg shadow-primary/25">
                                            {isSaving ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Guardando...
                                                </>
                                            ) : (
                                                <>
                                                    {isEditMode ? "Guardar Cambios" : "Publicar Plantilla"}
                                                    <Check className="w-4 h-4 ml-2" />
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </CardContent>
            </Card>
        </div>
    );
}
