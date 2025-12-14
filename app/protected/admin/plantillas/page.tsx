import { createClient } from "@/utils/supabase/server";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Plus, FileText, Calendar, MoreVertical, Trash2, Edit, SparklesIcon } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/shared/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

export default async function AdminModelosPage() {
    const supabase = await createClient();

    const { data: forms } = await supabase
        .from('form_definitions')
        .select(`
      *,
      convenio_types (
        name,
        description
      )
    `)
        .order('created_at', { ascending: false });

    return (
        <div className="container mx-auto py-8 space-y-8 animate-fade-up">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                        Gestión de Plantillas
                    </h1>
                    <p className="text-muted-foreground max-w-2xl">
                        Administra los modelos de documentos inteligentes. Sube archivos .docx y configura sus variables dinámicas.
                    </p>
                </div>
                <Link href="/protected/admin/plantillas/new">
                    <Button className="shadow-lg shadow-primary/25">
                        <Plus className="w-4 h-4 mr-2" />
                        Nueva Plantilla
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {forms?.map((form) => (
                    <Card key={form.id} className="group hover:border-primary/30 transition-all duration-300">
                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                            <div className="p-2.5 bg-primary/10 rounded-xl text-primary group-hover:scale-110 transition-transform duration-300">
                                <FileText className="w-5 h-5" />
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                        <MoreVertical className="w-4 h-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <Link href={`/protected/admin/plantillas/${form.id}`}>
                                        <DropdownMenuItem className="cursor-pointer">
                                            <Edit className="w-4 h-4 mr-2" />
                                            Editar
                                        </DropdownMenuItem>
                                    </Link>
                                    <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer">
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Eliminar
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Badge variant="secondary" className="text-[10px] font-mono opacity-70">
                                    v{form.version}
                                </Badge>
                                {form.active ? (
                                    <Badge variant="success" className="text-[10px]">Activo</Badge>
                                ) : (
                                    <Badge variant="secondary" className="text-[10px]">Inactivo</Badge>
                                )}
                            </div>
                            <CardTitle className="text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                                {form.convenio_types?.name}
                            </CardTitle>
                            <CardDescription className="line-clamp-2 mb-4 h-10 text-xs">
                                {form.convenio_types?.description || "Sin descripción disponible para esta plantilla."}
                            </CardDescription>

                            <div className="flex items-center text-xs text-muted-foreground mt-4 pt-4 border-t border-border/50">
                                <Calendar className="w-3 h-3 mr-1.5" />
                                Actualizado el {new Date(form.created_at).toLocaleDateString()}
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {/* Empty State Card (if no forms) */}
                {(!forms || forms.length === 0) && (
                    <div className="col-span-full flex flex-col items-center justify-center py-16 bg-card/30 backdrop-blur-sm rounded-2xl border border-dashed border-white/10">
                        <div className="p-4 rounded-full bg-muted/30 mb-4">
                            <SparklesIcon className="w-8 h-8 text-muted-foreground opacity-50" />
                        </div>
                        <h3 className="text-lg font-medium">No hay plantillas definidas</h3>
                        <p className="text-muted-foreground mt-1 text-sm max-w-md text-center mb-6">
                            Comienza subiendo tu primer documento .docx para generar un formulario inteligente.
                        </p>
                        <Link href="/protected/admin/plantillas/new">
                            <Button variant="outline">Crear primera plantilla</Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
