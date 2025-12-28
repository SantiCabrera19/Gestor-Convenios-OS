import { createClient } from "@/infrastructure/supabase/server";
import { NextResponse } from "next/server";
import { getStorageProvider } from "@/shared/storage";

export async function POST(request: Request) {
    const supabase = await createClient();

    try {
        const body = await request.json();
        const { name, description, schema, template_content } = body;

        console.log('📋 [Templates API] Creating new template:', name);

        if (!name || !schema) {
            return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 });
        }

        // 1. Guardar el archivo de plantilla en storage si existe
        let templatePath = null;
        if (template_content) {
            try {
                // El template_content viene como base64, lo decodificamos
                const base64Data = template_content.split(',')[1] || template_content;
                const buffer = Buffer.from(base64Data, 'base64');

                const storage = getStorageProvider();
                const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                const fileName = `template_${slug}_${Date.now()}.docx`;

                // Carpeta dedicada para plantillas (separada de documentos generados)
                const TEMPLATES_FOLDER_ID = process.env.DRIVE_TEMPLATES_ID || '1adJF4HHCK2WQk3F13OnRJrj2o9yDb5Ew';

                console.log('📁 [Templates API] Uploading template file:', fileName, buffer.length, 'bytes');
                console.log('📦 [Templates API] Storage provider:', process.env.STORAGE_PROVIDER);
                console.log('📂 [Templates API] Target folder: TEMPLATES');

                const storedFile = await storage.saveFile(
                    buffer,
                    fileName,
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    TEMPLATES_FOLDER_ID  // Templates van a su carpeta dedicada, no a PENDING
                );

                console.log('✅ [Templates API] File saved:', storedFile);
                templatePath = storedFile.webViewLink || storedFile.downloadLink || storedFile.id;
                console.log('📄 [Templates API] Template path set to:', templatePath);
            } catch (uploadError) {
                console.error('❌ [Templates API] Error uploading template:', uploadError);
                // Continuamos sin plantilla si falla, pero el usuario debería saber
            }
        } else {
            console.log('⚠️ [Templates API] No template_content provided');
        }

        // 2. Crear el Tipo de Convenio (convenio_types)
        const fields = schema.steps.flatMap((step: any) => step.fields);

        const { data: typeData, error: typeError } = await supabase
            .from('convenio_types')
            .insert({
                name,
                description,
                template_content, // Mantenemos el base64 por compatibilidad
                fields
            })
            .select()
            .single();

        if (typeError) {
            console.error("Error creating convenio_type:", typeError);
            return NextResponse.json({ error: "Error al crear el tipo de convenio" }, { status: 500 });
        }

        // 3. Crear la Definición del Formulario (form_definitions) CON template_path
        const { data: formData, error: formError } = await supabase
            .from('form_definitions')
            .insert({
                convenio_type_id: typeData.id,
                schema: schema,
                active: true,
                version: 1,
                template_path: templatePath // ✅ AHORA SÍ guardamos el path
            })
            .select()
            .single();

        if (formError) {
            console.error("Error creating form_definition:", formError);
            await supabase.from('convenio_types').delete().eq('id', typeData.id);
            return NextResponse.json({ error: "Error al guardar la estructura del formulario" }, { status: 500 });
        }

        console.log('✅ [Templates API] Template created successfully:', { typeId: typeData.id, formId: formData.id, templatePath });

        return NextResponse.json({ success: true, data: { ...typeData, formId: formData.id } });

    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}
