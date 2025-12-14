import { createClient } from "@/infrastructure/supabase/server";
import { redirect } from "next/navigation";
import { GoogleDriveConfigClient } from "./GoogleDriveConfigClient";
import { SettingsIcon, CloudIcon, HardDriveIcon } from "lucide-react";
import { PageContainer } from "@/shared/components/ui/page-container";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";

export default async function ConfiguracionPage() {
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

  // Verificar si ya tiene tokens OAuth configurados
  const { data: existingTokens } = await supabase
    .from("google_oauth_tokens")
    .select("id, created_at, expires_at")
    .eq("user_id", user.id)
    .single();

  return (
    <PageContainer>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            Configuración
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Gestiona las integraciones y servicios en la nube.
          </p>
        </div>
        <div className="p-3 bg-primary/10 rounded-full">
          <SettingsIcon className="w-6 h-6 text-primary" />
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <CloudIcon className="w-5 h-5 text-primary" />
          Proveedores de Almacenamiento
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Google Drive - Active */}
          <GoogleDriveConfigClient
            hasExistingTokens={!!existingTokens}
            tokenInfo={existingTokens ? {
              createdAt: existingTokens.created_at,
              expiresAt: existingTokens.expires_at
            } : null}
          />

          {/* Dropbox - Coming Soon */}
          <Card className="border-white/5 bg-card/20 backdrop-blur-sm opacity-70 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7.06 5l-4.94 3.25 4.94 3.25 4.94-3.25-4.94-3.25zm9.88 0l-4.94 3.25 4.94 3.25 4.94-3.25-4.94-3.25zm-9.88 14l4.94-3.25-4.94-3.25-4.94 3.25 4.94 3.25zm9.88 0l4.94-3.25-4.94-3.25-4.94 3.25 4.94 3.25zm-4.94-7.5l-4.94 3.25 4.94 3.25 4.94-3.25-4.94-3.25z" />
                  </svg>
                </div>
                <Badge variant="outline" className="bg-background/50">Próximamente</Badge>
              </div>
              <CardTitle className="mt-4">Dropbox</CardTitle>
              <CardDescription>Sincronización empresarial</CardDescription>
            </CardHeader>
            <CardContent>
              <Button disabled variant="outline" className="w-full">Conectar</Button>
            </CardContent>
          </Card>

          {/* OneDrive - Coming Soon */}
          <Card className="border-white/5 bg-card/20 backdrop-blur-sm opacity-70 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-500">
                  <CloudIcon className="w-6 h-6" />
                </div>
                <Badge variant="outline" className="bg-background/50">Próximamente</Badge>
              </div>
              <CardTitle className="mt-4">OneDrive</CardTitle>
              <CardDescription>Microsoft 365 Integration</CardDescription>
            </CardHeader>
            <CardContent>
              <Button disabled variant="outline" className="w-full">Conectar</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
