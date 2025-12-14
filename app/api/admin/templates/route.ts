import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const supabase = await createClient();

    try {
        const body = await request.json();
        const { name, description, schema, template_content } = body;

        if (!name || !schema) {
            return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 });
        }

        // 1. Crear el Tipo de Convenio (convenio_types)
        // Extraemos los campos del schema para guardarlos en la columna 'fields'
        const fields = schema.steps.flatMap((step: any) => step.fields);

        const { data: typeData, error: typeError } = await supabase
            .from('convenio_types')
            .insert({
                name,
                description,
                template_content, // Guardamos el archivo base64
                fields // Guardamos los campos extraídos
            })
            .select()
            .single();

        if (typeError) {
            console.error("Error creating convenio_type:", typeError);
            return NextResponse.json({ error: "Error al crear el tipo de convenio" }, { status: 500 });
        }

        // 2. Crear la Definición del Formulario (form_definitions)
        const { data: formData, error: formError } = await supabase
            .from('form_definitions')
            .insert({
                convenio_type_id: typeData.id,
                schema: schema,
                active: true,
                version: 1
            })
            .select()
            .single();

        if (formError) {
            console.error("Error creating form_definition:", formError);
            // Rollback (opcional, idealmente usaríamos una transacción RPC si fuera crítico)
            await supabase.from('convenio_types').delete().eq('id', typeData.id);
            return NextResponse.json({ error: "Error al guardar la estructura del formulario" }, { status: 500 });
        }

        return NextResponse.json({ success: true, data: { ...typeData, formId: formData.id } });

    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}
