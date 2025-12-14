"use client";

import { useState } from "react";
import { FormSchema, FormField } from "@/lib/types/dynamic-form";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/shared/components/ui/select";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/shared/components/ui/accordion";
import { 
  Card, 
  CardContent, 
} from "@/shared/components/ui/card";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { TrashIcon, PlusIcon, SaveIcon, EyeIcon, SettingsIcon, FileTextIcon } from "lucide-react";
import { Switch } from "@/shared/components/ui/switch";

interface SchemaEditorProps {
  initialSchema: FormSchema;
  previewText: string;
  onPublish: (schema: FormSchema, name: string, slug: string, previewText: string) => void;
  onCancel: () => void;
}

export function SchemaEditor({ initialSchema, previewText, onPublish, onCancel }: SchemaEditorProps) {
  const [schema, setSchema] = useState<FormSchema>(initialSchema);
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");

  const handleFieldChange = (stepIndex: number, fieldIndex: number, key: keyof FormField, value: any) => {
    const newSchema = { ...schema };
    const field = newSchema.steps[stepIndex].fields[fieldIndex];
    
    // @ts-ignore
    field[key] = value;
    
    setSchema(newSchema);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormName(name);
    // Auto-generate slug
    setFormSlug(name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''));
  };

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-180px)] flex flex-col animate-in fade-in duration-500">
      {/* Header Area */}
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Editor de Plantilla</h2>
          <p className="text-muted-foreground mt-1">Configura los campos detectados y define las propiedades del formulario.</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2 h-10 px-4 shadow-sm hover:bg-muted/80 transition-colors">
              <EyeIcon className="w-4 h-4" />
              Ver Documento Original
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
            <DialogHeader className="p-6 border-b bg-muted/10 shrink-0">
              <DialogTitle className="flex items-center gap-2">
                <FileTextIcon className="w-5 h-5 text-primary" />
                Vista Previa del Documento
              </DialogTitle>
              <DialogDescription>
                Contenido extraído del archivo .docx para referencia de variables.
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto p-8 bg-zinc-100 dark:bg-zinc-900/50 flex justify-center">
              <div className="w-full max-w-[21cm] min-h-[29.7cm] bg-white text-black shadow-xl p-[2.5cm] mx-auto my-4">
                <div className="prose prose-sm max-w-none font-serif text-sm leading-relaxed whitespace-pre-wrap">
                  {previewText}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto pr-4 -mr-4 pb-8 space-y-8 custom-scrollbar">
        
        {/* Config Section */}
        <div className="bg-card border rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-lg flex items-center gap-2 mb-6 text-foreground">
            <SettingsIcon className="w-5 h-5 text-muted-foreground" />
            Configuración General
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2.5">
              <Label className="text-base font-medium">Nombre del Convenio</Label>
              <Input 
                className="h-11 text-base bg-background transition-all focus:ring-2 focus:ring-primary/20"
                placeholder="Ej: Convenio Pasantía Google" 
                value={formName}
                onChange={handleNameChange}
              />
            </div>
            <div className="space-y-2.5">
              <Label className="text-base font-medium">Slug (URL)</Label>
              <Input 
                className="h-11 font-mono text-sm bg-muted/30 text-muted-foreground"
                placeholder="convenio-pasantia-google" 
                value={formSlug}
                onChange={(e) => setFormSlug(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Fields Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <h3 className="font-semibold text-lg text-foreground">Campos Detectados</h3>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
              <PlusIcon className="w-4 h-4 mr-2" />
              Agregar Paso Manual
            </Button>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-4" defaultValue="step-0">
            {schema.steps.map((step, stepIndex) => (
              <AccordionItem key={step.id} value={`step-${stepIndex}`} className="border rounded-xl px-1 bg-card shadow-sm overflow-hidden transition-all data-[state=open]:ring-1 data-[state=open]:ring-primary/20">
                <AccordionTrigger className="hover:no-underline py-4 px-5 group">
                  <div className="flex items-center gap-4 w-full">
                    <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-sm font-bold group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      {stepIndex + 1}
                    </div>
                    <div className="flex flex-col items-start text-left flex-1">
                      <span className="text-base font-medium text-foreground">{step.title}</span>
                      <span className="text-xs text-muted-foreground font-normal">
                        {step.description || "Sin descripción"}
                      </span>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full mr-2">
                      {step.fields.length} campos
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-6 px-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-5 bg-muted/20 rounded-lg border border-dashed">
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Título del Paso</Label>
                      <Input 
                        className="bg-background"
                        value={step.title} 
                        onChange={(e) => {
                          const newSchema = { ...schema };
                          newSchema.steps[stepIndex].title = e.target.value;
                          setSchema(newSchema);
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Descripción</Label>
                      <Input 
                        className="bg-background"
                        value={step.description || ""} 
                        onChange={(e) => {
                          const newSchema = { ...schema };
                          newSchema.steps[stepIndex].description = e.target.value;
                          setSchema(newSchema);
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    {step.fields.map((field, fieldIndex) => (
                      <Card key={field.name} className="border shadow-sm hover:shadow-md transition-all duration-200 group">
                        <CardContent className="p-5">
                          <div className="grid grid-cols-12 gap-6 items-start">
                            {/* Columna 1: Identificación */}
                            <div className="col-span-12 md:col-span-5 space-y-3">
                              <div className="space-y-1.5">
                                <Label className="text-sm font-medium text-foreground">Etiqueta (Label)</Label>
                                <Input 
                                  className="h-10 bg-background group-hover:border-primary/50 transition-colors"
                                  value={field.label} 
                                  onChange={(e) => handleFieldChange(stepIndex, fieldIndex, 'label', e.target.value)}
                                />
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 p-2 rounded border border-transparent group-hover:border-border transition-colors">
                                <span className="font-mono font-semibold text-primary">{'{'}{field.name}{'}'}</span>
                                <span className="truncate opacity-70">Variable en documento</span>
                              </div>
                            </div>
                            
                            {/* Columna 2: Configuración */}
                            <div className="col-span-12 md:col-span-4 space-y-3">
                              <div className="space-y-1.5">
                                <Label className="text-sm font-medium text-foreground">Tipo de Campo</Label>
                                <Select 
                                  value={field.type} 
                                  onValueChange={(val: string) => handleFieldChange(stepIndex, fieldIndex, 'type', val)}
                                >
                                  <SelectTrigger className="h-10 bg-background">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="text">Texto Corto</SelectItem>
                                    <SelectItem value="textarea">Texto Largo</SelectItem>
                                    <SelectItem value="date">Fecha</SelectItem>
                                    <SelectItem value="email">Email</SelectItem>
                                    <SelectItem value="number">Número</SelectItem>
                                    <SelectItem value="select">Selección (Lista)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="flex items-center gap-2 pt-2">
                                <Switch 
                                  id={`req-${field.name}`}
                                  checked={field.required}
                                  onCheckedChange={(checked) => handleFieldChange(stepIndex, fieldIndex, 'required', checked)}
                                />
                                <Label htmlFor={`req-${field.name}`} className="text-sm cursor-pointer select-none">Obligatorio</Label>
                              </div>
                            </div>

                            {/* Columna 3: Acciones */}
                            <div className="col-span-12 md:col-span-3 flex md:flex-col items-end justify-between h-full gap-2 md:pl-4 md:border-l">
                              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                                <TrashIcon className="w-4 h-4" />
                              </Button>
                              
                              {field.type === 'select' && (
                                <Button variant="outline" size="sm" className="w-full text-xs">
                                  Opciones
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="sticky bottom-0 py-4 bg-background/80 backdrop-blur-md border-t flex justify-end gap-4 mt-auto z-20">
        <Button variant="outline" onClick={onCancel} className="h-11 px-8">Cancelar</Button>
        <Button 
          onClick={() => onPublish(schema, formName, formSlug, previewText)}
          disabled={!formName || !formSlug}
          className="h-11 px-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all"
        >
          <SaveIcon className="w-4 h-4 mr-2" />
          Publicar Formulario
        </Button>
      </div>
    </div>
  );
}
