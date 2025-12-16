import { createClient } from "@/infrastructure/supabase/server";
import { TemplateWizard } from "@/features/templates";
import { notFound } from "next/navigation";
import { PageContainer } from "@/shared/components/ui/page-container";
import { EditIcon } from "lucide-react";

export default async function EditTemplatePage({ params }: { params: { id: string } }) {
    const supabase = await createClient();
    const id = params.id;

    const { data: form, error } = await supabase
        .from('form_definitions')
        .select(`
      *,
      convenio_types (
        name,
        description
      )
    `)
        .eq('id', id)
        .single();

    if (error || !form) {
        notFound();
    }

    const initialData = {
        id: form.id,
        name: form.convenio_types?.name || "",
        description: form.convenio_types?.description || "",
        schema: form.schema
    };

    return (
        <PageContainer>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                        Editar Plantilla
                    </h1>
                    <p className="text-muted-foreground max-w-2xl">
                        Modifica el nombre, descripción o actualiza el archivo .docx de la plantilla.
                    </p>
                </div>
                <div className="p-3 bg-primary/10 rounded-full">
                    <EditIcon className="w-6 h-6 text-primary" />
                </div>
            </div>

            <TemplateWizard initialData={initialData} isEditMode={true} />
        </PageContainer>
    );
}
