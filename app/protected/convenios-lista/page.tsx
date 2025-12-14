import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { ConveniosListaClient } from "./ConveniosListaClient";
import { PageContainer } from "@/shared/components/ui/page-container";
import { FileTextIcon } from "lucide-react";

export default async function ConveniosListaPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const { data: convenios, error: conveniosError } = await supabase
    .from("convenios")
    .select("*, convenio_types(name)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (conveniosError) {
    console.error("Error fetching convenios:", conveniosError);
  }

  return (
    <PageContainer>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            Mis Convenios
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Aquí puedes ver y gestionar todos los convenios que has creado.
          </p>
        </div>
        <div className="p-3 bg-primary/10 rounded-full">
          <FileTextIcon className="w-6 h-6 text-primary" />
        </div>
      </div>
      <ConveniosListaClient convenios={convenios || []} />
    </PageContainer>
  );
}
