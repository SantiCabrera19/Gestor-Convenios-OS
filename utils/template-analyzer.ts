
import fs from 'fs';
import path from 'path';

// Nota: En producción, usarías una librería como 'mammoth' o 'pizzip' para leer .docx real.
// Este es un simulador de la lógica de extracción.

interface DetectedVariable {
  name: string;
  context: string; // Dónde se encontró (para sugerir descripción)
}

export function analyzeTemplate(filePath: string): any {
  // 1. Simulación de lectura de texto del DOCX
  // En realidad haríamos: const text = await mammoth.extractRawText({path: filePath});
  const mockDocContent = `
    CONVENIO MARCO ENTRE {nombre_entidad} Y LA UTN
    Representada por {nombre_representante}, DNI {dni_representante}...
    Con domicilio en {domicilio_entidad}, ciudad de {ciudad_entidad}...
  `;

  // 2. Regex para encontrar patrones {variable}
  const regex = /\{([a-zA-Z0-9_]+)\}/g;
  const matches = Array.from(mockDocContent.matchAll(regex));
  
  const uniqueVars = Array.from(new Set(matches.map(m => m[1])));

  // 3. Generar Schema Sugerido
  const suggestedSchema = {
    steps: [
      {
        id: "generated_step_1",
        title: "Datos Generales (Autodetectado)",
        description: "Campos detectados automáticamente del documento",
        icon: "FileTextIcon",
        fields: uniqueVars.map(varName => ({
          name: varName,
          label: formatLabel(varName),
          type: inferType(varName), // Heurística simple
          required: true,
          placeholder: `Ingrese ${formatLabel(varName)}`
        }))
      }
    ]
  };

  return suggestedSchema;
}

// Ayudantes de Heurística
function formatLabel(varName: string): string {
  return varName
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

function inferType(varName: string): string {
  if (varName.includes('fecha') || varName.includes('date')) return 'date';
  if (varName.includes('email') || varName.includes('correo')) return 'email';
  if (varName.includes('dni') || varName.includes('cuit') || varName.includes('telefono')) return 'text'; // O number
  return 'text';
}
