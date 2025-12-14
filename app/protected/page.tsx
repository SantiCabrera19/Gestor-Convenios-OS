import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import {
  FileTextIcon,
  ClockIcon,
  CheckCircleIcon,
  PlusIcon,
  ArrowRightIcon,
  TrendingUpIcon
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { PageContainer } from "@/shared/components/ui/page-container";

// Importar funciones de carga de datos
import {
  getConvenioTypes,
  getUserConvenios,
  getRecentActivity
} from "@/app/lib/dashboard";

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Usuario";

  // Cargar datos
  const [convenioTypes, convenios, activityItems] = await Promise.all([
    getConvenioTypes(),
    getUserConvenios(5),
    getRecentActivity(5)
  ]);

  // Calcular métricas rápidas (simuladas por ahora)
  const stats = [
    { label: "Acuerdos Activos", value: convenios.length, icon: FileTextIcon, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Pendientes", value: convenios.filter(c => c.status === 'pending').length, icon: ClockIcon, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Aprobados", value: convenios.filter(c => c.status === 'approved').length, icon: CheckCircleIcon, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Tasa de Éxito", value: "94%", icon: TrendingUpIcon, color: "text-violet-500", bg: "bg-violet-500/10" },
  ];

  return (
    <PageContainer>
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            Hola, {userName}
          </h1>
          <p className="text-muted-foreground mt-1">Aquí tienes un resumen de tu actividad en NexusDoc.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="hidden sm:flex">
            <ClockIcon className="mr-2 h-4 w-4" />
            Historial
          </Button>
          <Link href="/protected/solicitudes/new">
            <Button className="shadow-lg shadow-primary/25">
              <PlusIcon className="mr-2 h-4 w-4" />
              Nuevo Acuerdo
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <Card key={i} className="border-white/5 bg-card/40 hover:bg-card/60 transition-colors backdrop-blur-sm">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content: Recent Agreements */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Acuerdos Recientes</h2>
            <Link href="/protected/convenios-lista" className="text-sm text-primary hover:underline flex items-center">
              Ver todos <ArrowRightIcon className="ml-1 h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-4">
            {convenios.length > 0 ? (
              convenios.map((convenio) => (
                <Card key={convenio.id} className="group hover:border-primary/30 transition-all duration-300 border-white/10 bg-card/40 backdrop-blur-sm">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <FileTextIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate group-hover:text-primary transition-colors">{convenio.title}</h4>
                      <p className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                        <span>{new Date(convenio.date).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{convenio.type}</span>
                      </p>
                    </div>
                    <Badge variant={
                      convenio.status === 'approved' ? 'success' :
                        convenio.status === 'pending' ? 'warning' : 'secondary'
                    }>
                      {convenio.status === 'approved' ? 'Aprobado' :
                        convenio.status === 'pending' ? 'Pendiente' : 'Borrador'}
                    </Badge>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="border-dashed border-2 bg-transparent border-white/10">
                <CardContent className="p-8 text-center">
                  <div className="mx-auto h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                    <FileTextIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium">No hay acuerdos recientes</h3>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">Comienza creando tu primer documento.</p>
                  <Link href="/protected/solicitudes/new">
                    <Button variant="outline" size="sm">Crear Acuerdo</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Sidebar: Quick Actions & Templates */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Plantillas Rápidas</h2>
          <div className="grid gap-4">
            {convenioTypes.slice(0, 3).map((type) => (
              <Link key={type.id} href={`/protected/solicitudes/new?type=${type.id}`} className="block">
                <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full border-white/10 bg-card/40 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg bg-primary/10 text-primary`}>
                        <FileTextIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{type.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {type.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}

            <Link href="/protected/solicitudes/new">
              <Button variant="ghost" className="w-full justify-between text-muted-foreground hover:text-primary">
                Ver todas las plantillas <ArrowRightIcon className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
