import { createClient } from "@/infrastructure/supabase/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AdminPanelClient } from "@/app/protected/admin/AdminPanelClient";
import { PageContainer } from "@/shared/components/ui/page-container";
import { ShieldCheckIcon } from "lucide-react";

export default async function AdminPage() {
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

  // Obtener todos los convenios
  const { data: convenios, error } = await supabase
    .from("convenios")
    .select(`
      *,
      profiles:user_id (
        full_name,
        role
      ),
      convenio_types (
        name
      ),
      observaciones (
        id,
        content,
        created_at,
        resolved
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error al obtener convenios:", error);
    return (
      <PageContainer>
        <div className="text-center py-16 text-destructive">
          <p className="text-lg font-semibold">Error al cargar los convenios</p>
          <p className="text-sm mt-2">Por favor, intenta recargar la página</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            Administración
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Panel de control centralizado para la gestión de convenios.
          </p>
        </div>
        <div className="p-3 bg-primary/10 rounded-full">
          <ShieldCheckIcon className="w-6 h-6 text-primary" />
        </div>
      </div>

      <Suspense fallback={<div className="h-64 w-full bg-muted/10 rounded-xl animate-pulse"></div>}>
        <AdminPanelClient convenios={convenios || []} />
      </Suspense>
    </PageContainer>
  );
}
