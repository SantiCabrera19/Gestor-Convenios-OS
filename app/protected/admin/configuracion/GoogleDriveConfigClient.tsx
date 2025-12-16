"use client";

import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import {
  CheckCircleIcon,
  AlertTriangle,
  CheckIcon,
  ExternalLinkIcon,
  SettingsIcon,
  AlertCircleIcon,
  CloudIcon,
  RefreshCwIcon
} from 'lucide-react'
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";

interface TokenInfo {
  createdAt: string;
  expiresAt: string | null;
}

interface GoogleDriveConfigClientProps {
  hasExistingTokens: boolean;
  tokenInfo: TokenInfo | null;
}

export function GoogleDriveConfigClient({
  hasExistingTokens,
  tokenInfo
}: GoogleDriveConfigClientProps) {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnectGoogleDrive = async () => {
    setIsConnecting(true);

    try {
      const response = await fetch('/api/auth/google/connect');
      const data = await response.json();

      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        throw new Error('No se pudo obtener la URL de autorización');
      }
    } catch (error) {
      console.error('Error conectando con Google Drive:', error);
      alert('Error al conectar con Google Drive. Inténtalo de nuevo.');
      setIsConnecting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "d 'de' MMMM 'de' yyyy 'a las' HH:mm", {
      locale: es
    });
  };

  const isTokenExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) <= new Date();
  };

  return (
    <Card className="border border-white/10 bg-card/40 backdrop-blur-md shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${hasExistingTokens ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'}`}>
              <CloudIcon className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-lg">Google Drive</CardTitle>
              <CardDescription>Almacenamiento de documentos</CardDescription>
            </div>
          </div>
          {hasExistingTokens ? (
            <Badge variant="success" className="gap-1">
              <CheckIcon className="h-3 w-3" /> Conectado
            </Badge>
          ) : (
            <Badge variant="warning" className="gap-1">
              <AlertTriangle className="h-3 w-3" /> Desconectado
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {hasExistingTokens && tokenInfo ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-xl">
              <div className="flex items-start gap-3">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-green-600 dark:text-green-400">Integración Activa</h4>
                  <p className="text-xs text-muted-foreground">
                    Los documentos generados se guardarán automáticamente en tu unidad.
                  </p>
                  <div className="pt-2 text-xs text-muted-foreground space-y-1">
                    <p>Conectado: {formatDate(tokenInfo.createdAt)}</p>
                    {tokenInfo.expiresAt && (
                      <p className={isTokenExpired(tokenInfo.expiresAt) ? "text-destructive" : ""}>
                        Expira: {formatDate(tokenInfo.expiresAt)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <Button
              onClick={handleConnectGoogleDrive}
              disabled={isConnecting}
              variant="outline"
              className="w-full"
            >
              {isConnecting ? (
                <>
                  <RefreshCwIcon className="h-4 w-4 mr-2 animate-spin" />
                  Actualizando...
                </>
              ) : (
                <>
                  <RefreshCwIcon className="h-4 w-4 mr-2" />
                  Reconectar Cuenta
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertCircleIcon className="h-5 w-5 text-amber-500 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-amber-600 dark:text-amber-400">Configuración Requerida</h4>
                  <p className="text-xs text-muted-foreground">
                    Para habilitar el almacenamiento automático, debes autorizar el acceso a Google Drive.
                    Solo necesitas hacerlo una vez.
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={handleConnectGoogleDrive}
              disabled={isConnecting}
              className="w-full shadow-lg shadow-primary/20"
            >
              {isConnecting ? (
                <>
                  <RefreshCwIcon className="h-4 w-4 mr-2 animate-spin" />
                  Conectando...
                </>
              ) : (
                <>
                  <ExternalLinkIcon className="h-4 w-4 mr-2" />
                  Conectar con Google
                </>
              )}
            </Button>
          </div>
        )}

        <div className="pt-4 border-t border-border/50">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Información del Sistema</h4>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-primary" />
              Almacenamiento centralizado en la cuenta del administrador.
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-primary" />
              Organización automática por carpetas y estados.
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-primary" />
              Sin límite de usuarios para la generación de documentos.
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
