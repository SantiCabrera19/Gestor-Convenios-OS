import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { FormSchema } from "@/lib/types/dynamic-form";
import { PageContainer } from "@/app/components/ui/page-container";
import { FormWrapper } from "./form-wrapper";
import { FileTextIcon } from "lucide-react";

interface PageProps {
  params: {
    formId: string;
  };
}

export default async function NewSolicitudFormPage({ params }: PageProps) {
  const supabase = createClient();
  const { formId } = params;

  const { data: form, error } = await supabase
    .from('form_definitions')
    .select(`
      *,
      convenio_types (
        name,
        description
      )
    `)
    .eq('id', formId)
    .single();

  if (error || !form) {
    console.error("Error fetching form:", error);
    return notFound();
  }

  const schema = form.schema as unknown as FormSchema;

  return (
    <PageContainer>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            {form.convenio_types?.name}
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            {form.convenio_types?.description}
          </p>
        </div>
        <div className="p-3 bg-primary/10 rounded-full">
          <FileTextIcon className="w-6 h-6 text-primary" />
        </div>
      </div>

      <FormWrapper formId={form.id} schema={schema} />
    </PageContainer>
  );
}
