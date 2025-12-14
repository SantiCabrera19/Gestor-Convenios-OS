import { createClient } from "@/infrastructure/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: { id: string } }) {
    const supabase = await createClient();
    const id = params.id;

    try {
        const { data, error } = await supabase
            .from('form_definitions')
            .select(`
        *,
        convenio_types (
          id,
          name,
          description
        )
      `)
            .eq('id', id)
            .single();

        if (error) {
            return NextResponse.json({ error: "Plantilla no encontrada" }, { status: 404 });
        }

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    const supabase = await createClient();
    const id = params.id;

    try {
        const body = await request.json();
        const { name, description, schema, template_content } = body;

        // 1. Obtener el form actual para saber su convenio_type_id
        const { data: currentForm, error: fetchError } = await supabase
            .from('form_definitions')
            .select('convenio_type_id')
            .eq('id', id)
            .single();

        if (fetchError || !currentForm) {
            return NextResponse.json({ error: "Plantilla no encontrada" }, { status: 404 });
        }

        // 2. Actualizar convenio_types (Nombre, Descripción y Contenido si existe)
        const updateData: any = {
            name,
            description,
            updated_at: new Date().toISOString()
        };
        if (template_content) {
            updateData.template_content = template_content;
        }

        // Si hay nuevo schema, actualizamos también los campos en convenio_types
        if (schema) {
            updateData.fields = schema.steps.flatMap((step: any) => step.fields);
        }

        const { error: typeError } = await supabase
            .from('convenio_types')
            .update(updateData)
            .eq('id', currentForm.convenio_type_id);

        if (typeError) throw typeError;

        // 3. Actualizar form_definitions (Schema)
        // Solo si se envió un schema nuevo (opcional en edición simple)
        if (schema) {
            const { error: formError } = await supabase
                .from('form_definitions')
                .update({
                    schema,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id);

            if (formError) throw formError;
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Update Error:", error);
        return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    const supabase = await createClient();
    const id = params.id;

    try {
        // 1. Obtener ID del tipo
        const { data: currentForm } = await supabase
            .from('form_definitions')
            .select('convenio_type_id')
            .eq('id', id)
            .single();

        if (!currentForm) {
            return NextResponse.json({ error: "No encontrado" }, { status: 404 });
        }

        // 2. Eliminar form_definitions
        const { error: formError } = await supabase
            .from('form_definitions')
            .delete()
            .eq('id', id);

        if (formError) throw formError;

        // 3. Eliminar convenio_types
        const { error: typeError } = await supabase
            .from('convenio_types')
            .delete()
            .eq('id', currentForm.convenio_type_id);

        if (typeError) throw typeError;

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Delete Error:", error);
        return NextResponse.json({ error: "Error al eliminar" }, { status: 500 });
    }
}
