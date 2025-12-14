import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { ArrowRightIcon, FileTextIcon, SparklesIcon } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/app/components/ui/badge";
import { PageContainer } from "@/app/components/ui/page-container";

export default async function NewSolicitudPage() {
  const supabase = await createClient();

  // Obtener formularios activos
  const { data: forms, error } = await supabase
    .from('form_definitions')
    .select(`
      id,
      version,
      convenio_types (
        id,
        name,
        description
      )
    `)
    .eq('active', true);

  if (error) {
    console.error("Error fetching forms:", error);
    return (
      <PageContainer>
        <div className="text-center py-16 text-destructive">
          <p className="text-lg font-semibold">Error cargando formularios disponibles.</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            Iniciar Nuevo Trámite
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Selecciona una plantilla inteligente para comenzar tu acuerdo.
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1 border-primary/20 bg-primary/5 text-primary">
          <SparklesIcon className="w-3 h-3 mr-2" />
          {forms?.length || 0} Plantillas Disponibles
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {forms && forms.length > 0 ? (
          forms.map((form: any) => (
            <Card key={form.id} className="group hover:border-primary/50 hover:bg-card/60 transition-all duration-300 cursor-pointer relative overflow-hidden border-white/10 bg-card/40 backdrop-blur-sm">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity" />

              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2.5 bg-primary/10 rounded-xl text-primary group-hover:scale-110 transition-transform duration-300">
                    <FileTextIcon className="w-5 h-5" />
                  </div>
                  <Badge variant="secondary" className="text-[10px] font-mono opacity-50">
                    v{form.version}
                  </Badge>
                </div>
                <CardTitle className="text-xl group-hover:text-primary transition-colors">
                  {form.convenio_types?.name || "Convenio Sin Nombre"}
                </CardTitle>
                <CardDescription className="line-clamp-2 text-sm mt-1">
                  {form.convenio_types?.description || "Sin descripción disponible."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={`/protected/solicitudes/new/${form.id}`} className="block mt-2">
                  <Button className="w-full group/btn shadow-lg shadow-primary/10 hover:shadow-primary/25">
                    Comenzar
                    <ArrowRightIcon className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-16 bg-card/30 backdrop-blur-sm rounded-2xl border border-dashed border-white/10">
            <div className="p-4 rounded-full bg-muted/30 mb-4">
              <FileTextIcon className="w-8 h-8 text-muted-foreground opacity-50" />
            </div>
            <h3 className="text-lg font-medium">No hay plantillas disponibles</h3>
            <p className="text-muted-foreground mt-1 text-sm max-w-md text-center">
              Contacta al administrador del sistema para que publique nuevas plantillas de acuerdos.
            </p>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
