
import { createClient } from "@/infrastructure/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { getStorageProvider } from "@/shared/storage";

export async function POST(request: NextRequest) {
  const supabase = createClient();

  // Verificar autenticación
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const schemaJson = formData.get("schema") as string;
    const file = formData.get("file") as File | null;
    const convenio_type_id = formData.get("convenio_type_id") as string;
    const template_content = formData.get("template_content") as string;

    if (!schemaJson) {
      return NextResponse.json({ error: "Schema is required" }, { status: 400 });
    }

    const schema = JSON.parse(schemaJson);

    let typeId = convenio_type_id ? parseInt(convenio_type_id) : null;

    // 1. Si no hay ID pero hay nombre, crear el tipo de convenio
    if (!typeId && name) {
      const { data: newType, error: typeError } = await supabase
        .from('convenio_types')
        .insert({
          name: name,
          description: `Convenio generado dinámicamente: ${name}`,
          template_content: template_content || "", // Insertamos el contenido o string vacío
          fields: [] // Satisfacer constraint de columna legacy o requerida
        })
        .select()
        .single();

      if (typeError) throw typeError;
      typeId = newType.id;
    }

    if (!typeId) {
      return NextResponse.json({ error: "Se requiere convenio_type_id o name para crear uno nuevo" }, { status: 400 });
    }

    // 2. Guardar archivo si existe
    let templatePath = null;
    if (file) {
      console.log('📁 [Forms API] Uploading template file:', file.name, file.size);
      const buffer = Buffer.from(await file.arrayBuffer());
      const storage = getStorageProvider();
      console.log('📦 [Forms API] Storage provider:', process.env.STORAGE_PROVIDER);
      // Guardar en carpeta "templates" (o root si no existe lógica de carpetas aún)
      // Usamos un nombre único para evitar colisiones
      const fileName = `template_${slug}_${Date.now()}.docx`;
      try {
        const storedFile = await storage.saveFile(buffer, fileName, file.type || "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        console.log('✅ [Forms API] File saved:', storedFile);
        templatePath = storedFile.downloadLink || storedFile.webViewLink || storedFile.id;
        console.log('📄 [Forms API] Template path set to:', templatePath);
      } catch (uploadError) {
        console.error('❌ [Forms API] Error uploading template:', uploadError);
      }
    } else {
      console.log('⚠️ [Forms API] No file provided in form data');
    }

    // 3. Desactivar versiones anteriores (si existen)
    await supabase
      .from('form_definitions')
      .update({ active: false })
      .eq('convenio_type_id', typeId);

    // 4. Insertar nueva definición
    const { data: newForm, error: formError } = await supabase
      .from('form_definitions')
      .insert({
        convenio_type_id: typeId,
        schema: schema,
        active: true,
        version: 1, // En un sistema real, incrementaríamos la versión
        template_path: templatePath
      })
      .select()
      .single();

    if (formError) throw formError;

    return NextResponse.json({
      success: true,
      message: "Formulario publicado correctamente",
      form: newForm,
      convenio_type_id: typeId
    });

  } catch (error: any) {
    console.error("Error publicando formulario:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
