import { createClient } from "@/utils/supabase/server";
import { NextResponse } from 'next/server';
// Asumimos que estas utilidades no dependen del contexto de React y pueden importarse aquí
// Si dependen de React, habrá que ajustar o no usarlas en la API.
import { getIconForType, getColorForType } from "@/app/lib/dashboard/utils";

// Definimos la interfaz aquí también para claridad
export interface ConvenioTypeApiData {
  id: number;
  title: string;
  description: string;
  // Nota: No podemos devolver React Nodes directamente desde una API JSON.
  // Devolveremos identificadores o nombres para que el frontend los use.
  iconName: string; // Ejemplo: 'marco', 'practicas', etc.
  colorName: string; // Ejemplo: 'blue', 'teal', etc.
  previewUrl: string;
}

// Datos de fallback (si no hay nada en la DB)
const defaultConvenioTypes: ConvenioTypeApiData[] = [
  {
    id: 1,
    title: "Convenio Marco",
    description: "Establece lineamientos generales de colaboración institucional.",
    iconName: "marco",
    colorName: "Convenio Marco",
    previewUrl: "/plantillas/marco/preview"
  },
  {
    id: 4,
    title: "Convenio Marco Práctica Supervisada",
    description: "Establece las condiciones generales para la realización de prácticas supervisadas de estudiantes entre la Facultad y una entidad externa.",
    iconName: "graduation-cap",
    colorName: "Convenio Marco Práctica Supervisada",
    previewUrl: "/plantillas/practica-marco/preview"
  },
  {
    id: 3,
    title: "Convenio Específico",
    description: "Convenio específico para asistencia técnica, colaboración o capacitación entre la Facultad y una entidad externa.",
    iconName: "especifico",
    colorName: "Convenio Específico",
    previewUrl: "/plantillas/especifico/preview"
  },
  {
    id: 6,
    title: "Convenio Particular de Práctica Supervisada",
    description: "Para realizar prácticas laborales supervisadas en organizaciones externas.",
    iconName: "practicas",
    colorName: "Convenio Particular de Práctica Supervisada",
    previewUrl: "/plantillas/practica-particular/preview"
  },

];

export async function GET() {
  const supabase = await createClient();

  // Opcional: Verificar sesión si solo usuarios logueados pueden ver tipos
  // const { data: { session } } = await supabase.auth.getSession();
  // if (!session) {
  //   return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  // }

  try {
    // 1. Obtener tipos de convenio que tengan una definición de formulario activa
    const { data, error } = await supabase
      .from('form_definitions')
      .select(`
        id,
        convenio_types (
          id,
          name,
          description
        )
      `)
      .eq('active', true);

    if (error) {
      console.error("API Error fetching convenio types:", error);
      return NextResponse.json({ error: 'Error al obtener tipos de convenio', details: error.message }, { status: 500 });
    }

    let responseData: ConvenioTypeApiData[];

    if (!data || data.length === 0) {
      // Si no hay datos, devolvemos array vacío (o fallback si prefieres mantener los viejos mientras migras)
      responseData = [];
    } else {
      // Transformamos los datos de la DB al formato de la API
      responseData = data.map((form: any) => ({
        id: form.id, // Usamos el ID del formulario, no del tipo, para enlazar directo
        title: form.convenio_types.name,
        description: form.convenio_types.description || "Sin descripción",
        iconName: "file-text", // Icono genérico por ahora
        colorName: "blue", // Color genérico por ahora
        previewUrl: "#" // Sin preview por ahora
      }));
    }

    return NextResponse.json(responseData);

  } catch (e: any) {
    console.error("API Route Exception:", e);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
} 
