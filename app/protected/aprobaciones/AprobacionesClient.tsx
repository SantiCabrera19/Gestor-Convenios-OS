"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Search, Filter, Calendar, FileText, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";

export function AprobacionesClient({ convenios }: { convenios: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Filtra solo los que están 'enviado' o 'revision'
  const conveniosParaAprobar = (convenios || []).filter(c =>
    c.status === 'enviado' || c.status === 'revision'
  );

  const filteredConvenios = conveniosParaAprobar.filter((convenio) => {
    const matchesSearch = convenio.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      convenio.convenio_types?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || convenio.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Filters */}
      <Card className="border-white/10 bg-card/40 backdrop-blur-md">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar convenios..."
              className="pl-9 bg-background/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-[200px]">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-background/50">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <SelectValue placeholder="Estado" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="enviado">Enviado</SelectItem>
                <SelectItem value="revision">En Revisión</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredConvenios.length > 0 ? (
          filteredConvenios.map((convenio) => (
            <Card key={convenio.id} className="group hover:border-primary/30 transition-all duration-300 border-white/10 bg-card/40 backdrop-blur-md">
              <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-xl text-primary group-hover:scale-110 transition-transform duration-300 mt-1">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                        {convenio.title || "Sin título"}
                      </h3>
                      <Badge variant={convenio.status === 'enviado' ? 'warning' : 'info'}>
                        {convenio.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {convenio.convenio_types?.name}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(convenio.created_at).toLocaleDateString('es-ES', { dateStyle: 'long' })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
                  <Link href={`/protected/convenio-detalle/${convenio.id}`} className="w-full md:w-auto">
                    <Button className="w-full shadow-lg shadow-primary/20 group-hover:shadow-primary/40">
                      Revisar
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-16 bg-card/30 backdrop-blur-sm rounded-2xl border border-dashed border-white/10">
            <div className="p-4 rounded-full bg-muted/30 mb-4">
              <FileText className="w-8 h-8 text-muted-foreground opacity-50" />
            </div>
            <h3 className="text-lg font-medium">No se encontraron convenios</h3>
            <p className="text-muted-foreground mt-1 text-sm">
              No hay convenios pendientes que coincidan con tu búsqueda.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}