"use client";

import { useState } from "react";
import { FormField } from "@/shared/types/dynamic-form";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/shared/components/ui/dialog";
import { PencilIcon, CheckIcon } from "lucide-react";

interface FieldEditorProps {
    field: FormField;
    onSave: (updatedField: FormField) => void;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const FIELD_TYPES = [
    { value: "text", label: "Texto" },
    { value: "number", label: "Número" },
    { value: "email", label: "Email" },
    { value: "date", label: "Fecha" },
    { value: "textarea", label: "Área de Texto" },
    { value: "select", label: "Selector" },
    { value: "checkbox", label: "Casilla de Verificación" },
];

export function FieldEditor({ field, onSave, open, onOpenChange }: FieldEditorProps) {
    const [editedField, setEditedField] = useState<FormField>({ ...field });

    const handleSave = () => {
        onSave(editedField);
        onOpenChange(false);
    };

    const handleTypeChange = (newType: string) => {
        setEditedField(prev => ({
            ...prev,
            type: newType as FormField["type"],
            // Reset options if not a select type
            options: newType === "select" ? prev.options || [] : undefined,
        }));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] border-white/10 bg-card/95 backdrop-blur-xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <PencilIcon className="w-5 h-5 text-primary" />
                        Editar Campo
                    </DialogTitle>
                    <DialogDescription>
                        Modifica las propiedades del campo. El nombre interno <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{field.name}</code> no se puede cambiar.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* Label */}
                    <div className="space-y-2">
                        <Label htmlFor="label">Etiqueta visible</Label>
                        <Input
                            id="label"
                            value={editedField.label}
                            onChange={(e) => setEditedField(prev => ({ ...prev, label: e.target.value }))}
                            placeholder="Ej: DNI del Estudiante"
                            className="bg-background/50"
                        />
                        <p className="text-xs text-muted-foreground">
                            Este es el texto que verá el usuario al completar el formulario.
                        </p>
                    </div>

                    {/* Type */}
                    <div className="space-y-2">
                        <Label htmlFor="type">Tipo de campo</Label>
                        <Select value={editedField.type} onValueChange={handleTypeChange}>
                            <SelectTrigger className="bg-background/50">
                                <SelectValue placeholder="Seleccionar tipo..." />
                            </SelectTrigger>
                            <SelectContent>
                                {FIELD_TYPES.map(type => (
                                    <SelectItem key={type.value} value={type.value}>
                                        {type.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Placeholder */}
                    <div className="space-y-2">
                        <Label htmlFor="placeholder">Placeholder (texto de ayuda)</Label>
                        <Input
                            id="placeholder"
                            value={editedField.placeholder || ""}
                            onChange={(e) => setEditedField(prev => ({ ...prev, placeholder: e.target.value }))}
                            placeholder="Ej: Ingrese su número de documento..."
                            className="bg-background/50"
                        />
                    </div>

                    {/* Validation Section */}
                    <div className="space-y-4 p-4 rounded-lg border border-border/50 bg-muted/5">
                        <h4 className="font-medium text-sm">Validaciones</h4>

                        <div className="flex items-center space-x-3">
                            <Checkbox
                                id="required"
                                checked={editedField.required}
                                onCheckedChange={(checked) => setEditedField(prev => ({ ...prev, required: !!checked }))}
                            />
                            <Label htmlFor="required" className="font-normal cursor-pointer">
                                Campo obligatorio
                            </Label>
                        </div>

                        {(editedField.type === "number" || editedField.type === "text") && (
                            <div className="grid grid-cols-2 gap-4">
                                {editedField.type === "number" && (
                                    <>
                                        <div className="space-y-2">
                                            <Label htmlFor="min">Valor mínimo</Label>
                                            <Input
                                                id="min"
                                                type="number"
                                                value={editedField.validation?.min ?? ""}
                                                onChange={(e) => setEditedField(prev => ({
                                                    ...prev,
                                                    validation: { ...prev.validation, min: e.target.value ? Number(e.target.value) : undefined }
                                                }))}
                                                className="bg-background/50"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="max">Valor máximo</Label>
                                            <Input
                                                id="max"
                                                type="number"
                                                value={editedField.validation?.max ?? ""}
                                                onChange={(e) => setEditedField(prev => ({
                                                    ...prev,
                                                    validation: { ...prev.validation, max: e.target.value ? Number(e.target.value) : undefined }
                                                }))}
                                                className="bg-background/50"
                                            />
                                        </div>
                                    </>
                                )}
                                {editedField.type === "text" && (
                                    <div className="col-span-2 space-y-2">
                                        <Label htmlFor="pattern">Patrón de validación (Regex)</Label>
                                        <Input
                                            id="pattern"
                                            value={editedField.validation?.pattern ?? ""}
                                            onChange={(e) => setEditedField(prev => ({
                                                ...prev,
                                                validation: { ...prev.validation, pattern: e.target.value || undefined }
                                            }))}
                                            placeholder="Ej: ^\\d+$ (solo números)"
                                            className="bg-background/50 font-mono text-sm"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Usa <code className="bg-muted px-1 rounded">^\d+$</code> para aceptar solo números.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSave} className="shadow-lg shadow-primary/20">
                        <CheckIcon className="w-4 h-4 mr-2" />
                        Guardar Cambios
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
