
import { createClient } from "@/infrastructure/supabase/server";
import { redirect } from "next/navigation";
import { TemplateManagerClient } from "./TemplateManagerClient";
import {
  BackgroundPattern,
  DashboardHeader,
  SectionContainer
} from "@/app/components/dashboard";

export default async function TemplatesPage() {
  const supabase = await createClient();

  // Verificar si el usuario es admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect("/sign-in");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return redirect("/protected");
  }

  return (
    <div className="w-full">
      <BackgroundPattern />
      <div className="p-6">
        <DashboardHeader
          name="Gestión de Plantillas"
          subtitle="Sube tus documentos Word (.docx) y convierte automáticamente las variables en formularios dinámicos."
        />
        
        <div className="mt-6">
          <SectionContainer title="Nueva Plantilla">
            <TemplateManagerClient />
          </SectionContainer>
        </div>
      </div>
    </div>
  );
}
