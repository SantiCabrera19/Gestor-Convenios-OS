import { createClient } from "@/infrastructure/supabase/server";
import { redirect } from "next/navigation";
import { AprobacionesClient } from "./AprobacionesClient";
import { PageContainer } from "@/shared/components/ui/page-container";
import { CheckCircle2 } from "lucide-react";

export default async function AprobacionesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Por ahora, traemos todos los convenios. El cliente se encarga de filtrar
  // los que son relevantes para aprobación ('enviado', 'revision').
  const { data: convenios, error: conveniosError } = await supabase
    .from("convenios")
    .select("*, convenio_types(name)")
    .order("created_at", { ascending: false });

  if (conveniosError) {
    console.error("Error fetching convenios for approval:", conveniosError);
  }

  return (
    <PageContainer>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            Aprobaciones
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Revisa y gestiona los convenios pendientes de aprobación.
          </p>
        </div>
        <div className="p-3 bg-primary/10 rounded-full">
          <CheckCircle2 className="w-6 h-6 text-primary" />
        </div>
      </div>

      <AprobacionesClient convenios={convenios || []} />
    </PageContainer>
  );
}
