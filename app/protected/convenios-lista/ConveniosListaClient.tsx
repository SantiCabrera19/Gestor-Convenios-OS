"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/app/components/ui/table";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/app/components/ui/dropdown-menu";
import {
  FileTextIcon,
  MoreHorizontalIcon,
  SearchIcon,
  FilterIcon,
  DownloadIcon,
  EyeIcon,
  TrashIcon
} from "lucide-react";
import Link from "next/link";

export function ConveniosListaClient({ convenios }: { convenios: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const filteredConvenios = (convenios || []).filter((convenio) => {
    const matchesSearch = convenio.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || convenio.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return <Badge variant="success">Aprobado</Badge>;
      case 'pending': return <Badge variant="warning">Pendiente</Badge>;
      case 'rejected': return <Badge variant="destructive">Rechazado</Badge>;
      default: return <Badge variant="secondary">Borrador</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card/40 backdrop-blur-md p-4 rounded-xl border border-white/5">
        <div className="relative w-full sm:w-96">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar acuerdos..."
            className="pl-10 bg-background/50 border-transparent focus:border-primary/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 w-full sm:w-auto">
                <FilterIcon className="h-4 w-4" />
                Estado: {statusFilter === 'approved' ? 'Aprobados' : statusFilter === 'pending' ? 'Pendientes' : statusFilter ? 'Otros' : 'Todos'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setStatusFilter(null)}>Todos</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('approved')}>Aprobados</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('pending')}>Pendientes</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('draft')}>Borradores</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-white/10 bg-card/40 backdrop-blur-md overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent border-white/5">
              <TableHead className="w-[300px]">Título del Acuerdo</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredConvenios.length > 0 ? (
              filteredConvenios.map((convenio) => (
                <TableRow key={convenio.id} className="hover:bg-muted/30 border-white/5 transition-colors">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <FileTextIcon className="h-4 w-4" />
                      </div>
                      <span className="truncate max-w-[200px] sm:max-w-xs" title={convenio.title}>
                        {convenio.title}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{convenio.convenio_types.name}</TableCell>
                  <TableCell>{getStatusBadge(convenio.status)}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(convenio.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontalIcon className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <Link href={`/protected/convenio-detalle/${convenio.id}`}>
                          <DropdownMenuItem className="cursor-pointer">
                            <EyeIcon className="mr-2 h-4 w-4" /> Ver detalles
                          </DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem className="cursor-pointer">
                          <DownloadIcon className="mr-2 h-4 w-4" /> Descargar PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer">
                          <TrashIcon className="mr-2 h-4 w-4" /> Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No se encontraron acuerdos.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}