
import { NextRequest, NextResponse } from "next/server";
import mammoth from "mammoth";
import { FormSchema, FormStep, FormField } from "@/lib/types/dynamic-form";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No se proporcionó ningún archivo" },
        { status: 400 }
      );
    }

    // Convertir File a Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Extraer texto con Mammoth
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value;
    const messages = result.messages; // Advertencias de mammoth

    // Analizar variables
    const schema = analyzeTextAndGenerateSchema(text);

    return NextResponse.json({
      schema,
      preview: text.substring(0, 500) + "...",
      warnings: messages
    });

  } catch (error: any) {
    console.error("Error analizando plantilla:", error);
    return NextResponse.json(
      { error: error.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}

function analyzeTextAndGenerateSchema(text: string): FormSchema {
  // Regex para encontrar {variable}
  const regex = /\{([a-zA-Z0-9_]+)\}/g;
  const matches = Array.from(text.matchAll(regex));

  // Obtener variables únicas
  const uniqueVars = Array.from(new Set(matches.map(m => m[1])));

  // Definir los buckets para los pasos
  // Definir los buckets para los pasos
  const steps: FormStep[] = [
    {
      id: "step_1_datos",
      title: "Datos Personales y Entidad",
      description: "Información de la empresa, representante y pasante",
      icon: "UserIcon",
      fields: []
    },
    {
      id: "step_2_fechas",
      title: "Fechas y Vigencia",
      description: "Plazos, inicio, fin y duración del convenio",
      icon: "CalendarIcon",
      fields: []
    },
    {
      id: "step_3_detalles",
      title: "Detalles de la Pasantía",
      description: "Cargo, horario, asignación estímulo y tareas",
      icon: "BriefcaseIcon",
      fields: []
    },
    {
      id: "step_4_clausulas",
      title: "Cláusulas y Condiciones",
      description: "Información legal y condiciones adicionales",
      icon: "FileTextIcon",
      fields: []
    }
  ];

  // Palabras clave para categorización
  const keywords = {
    step1: ['nombre', 'empresa', 'entidad', 'cuit', 'dni', 'representante', 'domicilio', 'ciudad', 'provincia', 'email', 'telefono', 'pasante', 'alumno', 'apellido'],
    step2: ['fecha', 'date', 'mes', 'anio', 'vencimiento', 'plazo', 'duracion', 'inicio', 'fin', 'vigencia', 'periodo'],
    step3: ['cargo', 'puesto', 'horario', 'tutor', 'plan', 'tarea', 'actividad', 'area', 'departamento', 'monto', 'asignacion', 'estimulo', 'pago'],
    step4: ['clausula', 'ley', 'decreto', 'normativa', 'seguro', 'obra', 'social', 'art', 'condicion', 'acuerdo', 'parte']
  };

  uniqueVars.forEach(varName => {
    const lower = varName.toLowerCase();
    const field: FormField = {
      name: varName,
      label: formatLabel(varName),
      type: inferType(varName),
      placeholder: `Ingrese ${formatLabel(varName)}`,
      required: true,
      validation: inferValidation(varName)
    };

    // Categorización Contextual
    if (keywords.step2.some(k => lower.includes(k))) {
      steps[1].fields.push(field);
    } else if (keywords.step3.some(k => lower.includes(k))) {
      steps[2].fields.push(field);
    } else if (keywords.step4.some(k => lower.includes(k))) {
      steps[3].fields.push(field);
    } else {
      // Por defecto al paso 1 (Datos)
      steps[0].fields.push(field);
    }
  });

  // Filtrar pasos vacíos, pero asegurar que siempre haya al menos uno y el de confirmación/cláusulas si tiene algo
  // La lógica de negocio pide 4 pasos, así que intentaremos mantenerlos si tienen contenido.
  // Si un paso intermedio queda vacío, lo ideal es quitarlo para no mostrar una pantalla vacía.
  const finalSteps = steps.filter(step => step.fields.length > 0);

  // Si por alguna razón todo se filtró (no debería), devolvemos al menos el paso 1 con los campos
  if (finalSteps.length === 0 && steps[0].fields.length > 0) {
    return { steps: [steps[0]] };
  }

  // Si no hay campos en absoluto (raro), devolvemos estructura vacía
  if (finalSteps.length === 0) {
    return { steps: [] };
  }

  return { steps: finalSteps };
}

// --- Helpers ---

function formatLabel(varName: string): string {
  return varName
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .replace(/\b\w/g, l => l.toUpperCase());
}

function inferType(varName: string): any {
  const lower = varName.toLowerCase();
  if (lower.includes('fecha') || lower.includes('date') || lower.includes('vencimiento') || lower.includes('inicio') || lower.includes('fin')) return 'date';
  if (lower.includes('email') || lower.includes('correo')) return 'email';
  if (lower.includes('observacion') || lower.includes('detalle') || lower.includes('descripcion') || lower.includes('tarea')) return 'textarea';
  if (lower.includes('mes')) return 'select';
  return 'text';
}

function inferValidation(varName: string): any {
  const lower = varName.toLowerCase();
  if (lower.includes('cuit') || lower.includes('cuil')) {
    return { min: 11, max: 13, pattern: "^\\d+(-\\d+)*$", message: "Formato de CUIT inválido" };
  }
  if (lower.includes('dni')) {
    return { min: 7, max: 8, pattern: "^\\d+$", message: "Solo números" };
  }
  if (lower.includes('email')) {
    return { pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$", message: "Email inválido" };
  }
  return undefined;
}
