"use client";

import { useEffect, useState } from "react";
import { getFormDefinition } from "@/app/actions/get-form-definition";
import { DynamicFormRenderer } from "@/features/agreements/components/forms/dynamic/DynamicFormRenderer";
import { FormDefinition } from "@/shared/types/dynamic-form";
import { Loader2 } from "lucide-react";
import { useToast } from "@/shared/components/ui/toast";

export default function TestDynamicPage() {
  const [formDef, setFormDef] = useState<FormDefinition | null>(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    async function load() {
      // ID 2 es Convenio Marco
      const def = await getFormDefinition(2);
      setFormDef(def);
      setLoading(false);
    }
    load();
  }, []);

  const handleSubmit = async (data: any) => {
    console.log("📝 Datos del formulario dinámico:", data);

    // Simular envío a la API
    try {
      const response = await fetch('/api/convenios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.nombre || "Convenio Dinámico Test",
          template_slug: 'nuevo-convenio-marco', // Usamos el slug existente para probar el backend
          form_data: data
        })
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error);

      toast.success("¡Éxito!", "El convenio dinámico se creó correctamente.");

    } catch (error: any) {
      toast.error("Error", error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Cargando receta del formulario...</span>
      </div>
    );
  }

  if (!formDef) {
    return <div className="p-10 text-red-500">No se encontró la definición del formulario (ID 2). ¿Ejecutaste el script SQL?</div>;
  }

  return (
    <div className="container mx-auto py-10 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🧪 Laboratorio de Formularios Dinámicos</h1>
        <p className="text-muted-foreground">
          Esta página renderiza el formulario basándose 100% en la configuración JSON de la base de datos.
        </p>
      </div>

      <div className="bg-card border rounded-xl shadow-sm">
        <DynamicFormRenderer
          schema={formDef.schema}
          onSubmit={handleSubmit}
        />
      </div>

      <div className="mt-8 p-4 bg-slate-100 dark:bg-slate-900 rounded-lg">
        <h3 className="font-mono text-sm font-bold mb-2">🔍 Receta JSON (Debug):</h3>
        <pre className="text-xs overflow-auto max-h-60">
          {JSON.stringify(formDef.schema, null, 2)}
        </pre>
      </div>
    </div>
  );
}
