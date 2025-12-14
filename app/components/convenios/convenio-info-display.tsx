'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronLeftIcon,
  FileTextIcon,
  CalendarIcon,
  BuildingIcon,
  UserIcon,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Edit,
  Download,
  InfoIcon
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/app/components/ui/button';
import { RequestModificationModal } from '@/app/components/ui/request-modification-modal';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface ConvenioInfoDisplayProps {
  convenioId: string;
}

interface ConvenioData {
  id: string;
  title: string;
  status: string;
  created_at: string;
  updated_at: string;
  content_data: any;
  form_data: any;
  convenio_types: {
    id: number;
    name: string;
  };
  profiles?: {
    full_name: string;
    email: string;
  };
}

const statusConfig = {
  pendiente: {
    icon: Clock,
    variant: 'warning' as const,
    label: 'Pendiente de Revisión'
  },
  aprobado: {
    icon: CheckCircle,
    variant: 'success' as const,
    label: 'Aprobado'
  },
  rechazado: {
    icon: XCircle,
    variant: 'destructive' as const,
    label: 'Rechazado'
  },
  enviado: {
    icon: Clock,
    variant: 'info' as const,
    label: 'Enviado'
  },
  borrador: {
    icon: FileTextIcon,
    variant: 'secondary' as const,
    label: 'Borrador'
  },
  revision_modificacion: {
    icon: AlertTriangle,
    variant: 'warning' as const,
    label: 'Solicitud de Modificación'
  }
};

export function ConvenioInfoDisplay({ convenioId }: ConvenioInfoDisplayProps) {
  const router = useRouter();
  const [convenio, setConvenio] = useState<ConvenioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchConvenio();
  }, [convenioId]);

  const fetchConvenio = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/convenios/${convenioId}`);

      if (!response.ok) {
        throw new Error('No se pudo cargar el convenio');
      }

      const data = await response.json();
      setConvenio(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    if (!convenio) return;

    const convenioTypeName = convenio.convenio_types.name.toLowerCase();
    let typeSlug = '';

    if (convenioTypeName.includes('marco') && convenioTypeName.includes('práctica')) {
      typeSlug = 'practica-marco';
    } else if (convenioTypeName.includes('marco')) {
      typeSlug = 'marco';
    } else if (convenioTypeName.includes('específico')) {
      typeSlug = 'especifico';
    } else if (convenioTypeName.includes('particular')) {
      typeSlug = 'particular';
    } else if (convenioTypeName.includes('acuerdo')) {
      typeSlug = 'acuerdo';
    }

    router.push(`/protected/convenio-detalle/${convenioId}?type=${typeSlug}&mode=correccion`);
  };

  const renderBasicInfo = () => {
    if (!convenio?.form_data) return null;

    const data = convenio.form_data;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Información del Estudiante/Alumno */}
        {data.alumno_nombre && (
          <Card className="border-white/10 bg-card/40 backdrop-blur-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2 text-primary">
                <UserIcon className="w-5 h-5" />
                Información del Estudiante
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <span className="text-muted-foreground block text-xs uppercase tracking-wider">Estudiante</span>
                <p className="font-medium text-base">{data.alumno_nombre}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {data.alumno_carrera && (
                  <div>
                    <span className="text-muted-foreground block text-xs uppercase tracking-wider">Carrera</span>
                    <p className="font-medium">{data.alumno_carrera}</p>
                  </div>
                )}
                {data.alumno_legajo && (
                  <div>
                    <span className="text-muted-foreground block text-xs uppercase tracking-wider">Legajo</span>
                    <p className="font-medium">{data.alumno_legajo}</p>
                  </div>
                )}
                {data.alumno_dni && (
                  <div>
                    <span className="text-muted-foreground block text-xs uppercase tracking-wider">DNI</span>
                    <p className="font-medium">***{data.alumno_dni.slice(-3)}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Información de la Empresa/Entidad */}
        <Card className="border-white/10 bg-card/40 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-primary">
              <BuildingIcon className="w-5 h-5" />
              Empresa/Entidad
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <span className="text-muted-foreground block text-xs uppercase tracking-wider">Nombre</span>
              <p className="font-medium text-base">{data.entidad_nombre || data.empresa_nombre || 'No especificado'}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {(data.entidad_tipo || data.empresa_tipo) && (
                <div>
                  <span className="text-muted-foreground block text-xs uppercase tracking-wider">Tipo</span>
                  <p className="font-medium">{data.entidad_tipo || data.empresa_tipo}</p>
                </div>
              )}
              {(data.entidad_cuit || data.empresa_cuit) && (
                <div>
                  <span className="text-muted-foreground block text-xs uppercase tracking-wider">CUIT</span>
                  <p className="font-medium">***{(data.entidad_cuit || data.empresa_cuit).slice(-4)}</p>
                </div>
              )}
            </div>
            {(data.entidad_domicilio || data.empresa_direccion_calle) && (
              <div>
                <span className="text-muted-foreground block text-xs uppercase tracking-wider">Dirección</span>
                <p className="font-medium">{data.entidad_domicilio || data.empresa_direccion_calle}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Representante/Contacto */}
        {(data.entidad_representante || data.representanteNombre || data.empresa_representante_nombre) && (
          <Card className="border-white/10 bg-card/40 backdrop-blur-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2 text-primary">
                <UserIcon className="w-5 h-5" />
                Representante Legal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-muted-foreground block text-xs uppercase tracking-wider">Nombre</span>
                  <p className="font-medium">
                    {data.entidad_representante || data.representanteNombre || data.empresa_representante_nombre}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs uppercase tracking-wider">Cargo</span>
                  <p className="font-medium">
                    {data.entidad_cargo || data.cargoRepresentante || data.empresa_representante_caracter || 'No especificado'}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {data.representante_telefono && (
                  <div>
                    <span className="text-muted-foreground block text-xs uppercase tracking-wider">Teléfono</span>
                    <p className="font-medium">{data.representante_telefono}</p>
                  </div>
                )}
                {data.representante_email && (
                  <div>
                    <span className="text-muted-foreground block text-xs uppercase tracking-wider">Email</span>
                    <p className="font-medium">{data.representante_email}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Fechas y Tipo de Convenio */}
        <Card className="border-white/10 bg-card/40 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-primary">
              <CalendarIcon className="w-5 h-5" />
              Detalles del Convenio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <span className="text-muted-foreground block text-xs uppercase tracking-wider">Tipo</span>
              <p className="font-medium text-base">{convenio.convenio_types.name}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-muted-foreground block text-xs uppercase tracking-wider">Creado</span>
                <p className="font-medium">{new Date(convenio.created_at).toLocaleDateString('es-ES')}</p>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs uppercase tracking-wider">Actualizado</span>
                <p className="font-medium">{new Date(convenio.updated_at).toLocaleDateString('es-ES')}</p>
              </div>
              {data.fecha_inicio && (
                <div>
                  <span className="text-muted-foreground block text-xs uppercase tracking-wider">Inicio</span>
                  <p className="font-medium">{new Date(data.fecha_inicio).toLocaleDateString('es-ES')}</p>
                </div>
              )}
              {data.fecha_fin && (
                <div>
                  <span className="text-muted-foreground block text-xs uppercase tracking-wider">Fin</span>
                  <p className="font-medium">{new Date(data.fecha_fin).toLocaleDateString('es-ES')}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Cargando convenio...</p>
        </div>
      </div>
    );
  }

  if (error || !convenio) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Error al cargar el convenio</h2>
        <p className="text-muted-foreground mb-6">{error || 'No se encontró el convenio'}</p>
        <Link href="/protected/convenios-lista">
          <Button variant="outline">
            <ChevronLeftIcon className="h-4 w-4 mr-2" />
            Volver a Mis Convenios
          </Button>
        </Link>
      </div>
    );
  }

  const statusInfo = statusConfig[convenio.status as keyof typeof statusConfig] || statusConfig.pendiente;
  const StatusIcon = statusInfo.icon;

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/protected/convenios-lista">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ChevronLeftIcon className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{convenio.title}</h1>
            <p className="text-muted-foreground text-sm">{convenio.convenio_types.name}</p>
          </div>
        </div>

        <Badge variant={statusInfo.variant} className="px-3 py-1.5 text-sm gap-2">
          <StatusIcon className="w-4 h-4" />
          {statusInfo.label}
        </Badge>
      </div>

      {/* Actions */}
      <Card className="border-white/10 bg-card/40 backdrop-blur-md">
        <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <InfoIcon className="w-4 h-4" />
            <span>
              {convenio.status === 'aprobado' && 'Este convenio está aprobado. Usa "Solicitar Modificación" para cambios.'}
              {convenio.status === 'borrador' && 'Este convenio es un borrador. Puedes continuar editándolo.'}
              {convenio.status === 'pendiente' && 'Esperando revisión administrativa.'}
            </span>
          </div>

          <div className="flex gap-2">
            {convenio.status === 'borrador' && (
              <Button onClick={handleEditClick} className="shadow-lg shadow-primary/20">
                <Edit className="w-4 h-4 mr-2" />
                Continuar Editando
              </Button>
            )}

            {convenio.status === 'aprobado' && (
              <Button
                onClick={() => setShowRequestModal(true)}
                variant="outline"
                className="border-yellow-500/50 text-yellow-600 hover:bg-yellow-500/10 dark:text-yellow-400"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Solicitar Modificación
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Info */}
      {renderBasicInfo()}

      {/* Modal */}
      <RequestModificationModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        convenioId={convenio.id}
        convenioTitle={convenio.title}
        onSuccess={() => window.location.reload()}
      />
    </div>
  );
}