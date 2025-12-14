"use server";

import { createClient } from "@/infrastructure/supabase/server";
import { redirect } from "next/navigation";
import { DocumentGenerator } from "@/shared/services/document-generator";
import { getStorageProvider } from "@/shared/storage";
import { revalidatePath } from "next/cache";

export async function submitSolicitud(formId: string, formData: any) {
  const supabase = createClient();

  // 1. Obtener el usuario actual
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Usuario no autenticado");
  }

  // 2. Obtener la definición del formulario para saber el tipo de convenio y la plantilla
  const { data: formDef, error: formError } = await supabase
    .from('form_definitions')
    .select('*, convenio_types(*)')
    .eq('id', formId)
    .single();

  if (formError || !formDef) {
    throw new Error("Formulario no encontrado");
  }

  // 3. Crear el registro en la tabla convenios
  const { data: convenio, error: insertError } = await supabase
    .from('convenios')
    .insert({
      title: `${formDef.convenio_types.name} - ${new Date().toLocaleDateString()}`,
      user_id: user.id,
      convenio_type_id: formDef.convenio_type_id,
      form_data: formData,
      status: 'borrador'
    })
    .select()
    .single();

  if (insertError) {
    console.error("Error creating convenio:", insertError);
    throw new Error("Error al guardar la solicitud");
  }

  // 4. Generar el documento
  try {
    if (formDef.template_path) {
      const generatedDocBuffer = await DocumentGenerator.generateDocument(formDef.template_path, formData);

      const storage = getStorageProvider();
      const fileName = `convenio_${convenio.id}.docx`;
      const pendingFolderId = storage.getSystemFolderId ? storage.getSystemFolderId('pending') : undefined;

      const savedFile = await storage.saveFile(
        generatedDocBuffer,
        fileName,
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        pendingFolderId
      );

      // Actualizar el convenio con la ruta del documento
      await supabase
        .from('convenios')
        .update({ document_path: savedFile.webViewLink }) // Guardamos el link web para acceso fácil
        .eq('id', convenio.id);

      console.log("Document generated and saved:", savedFile.id);
    }
  } catch (genError) {
    console.error("Error generating document:", genError);
    // No fallamos todo el proceso si falla la generación, el usuario puede reintentar luego
  }

  revalidatePath('/protected/dashboard');
  redirect('/protected/dashboard');
}
