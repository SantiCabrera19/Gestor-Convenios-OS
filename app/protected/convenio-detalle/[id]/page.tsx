"use client";

import { useSearchParams, useParams } from 'next/navigation';
import { ChevronLeftIcon, FileTextIcon } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/shared/components/ui/button";
import { ConvenioFormLayout } from "@/features/agreements/components/layout/ConvenioFormLayout";
import { ConvenioInfoDisplay } from "@/features/agreements/components/layout/convenio-info-display";
import { convenioConfigs } from "@/features/agreements/components/core/convenio-configs";

import { useConvenioMarcoStore } from "@/stores/convenioMarcoStore";
import { DynamicConvenioPage } from "@/features/agreements/components/forms/dynamic/DynamicConvenioPage";
import { PageContainer } from "@/shared/components/ui/page-container";
import { Card, CardContent } from "@/shared/components/ui/card";

export default function ConvenioPage() {
  const params = useParams<{ id: string }>();
  const paramId = params.id;
  const isCreating = paramId === "nuevo";
  const searchParams = useSearchParams();
  const type = searchParams.get('type') as keyof typeof convenioConfigs;
  const mode = searchParams.get('mode');

  const initializeStore = useConvenioMarcoStore((state) => state.initialize);
  const isStoreInitialized = useConvenioMarcoStore((state) => state.isInitialized);

  useEffect(() => {
    if (!isCreating && mode === 'correccion' && paramId) {
      initializeStore(paramId as unknown as any);
    }
  }, [isCreating, mode, paramId, initializeStore]);

  // 3. Vista de solo lectura (por defecto para convenios existentes)
  if (!isCreating && mode !== 'correccion') {
    return (
      <PageContainer>
        <ConvenioInfoDisplay convenioId={paramId} />
      </PageContainer>
    );
  }

  // 1. Creación de convenio nuevo
  if (isCreating && type && convenioConfigs[type]) {
    if (type === 'marco') {
      return (
        <PageContainer>
          <DynamicConvenioPage
            convenioTypeId={2}
            title="Nuevo Convenio Marco"
            slug="nuevo-convenio-marco"
          />
        </PageContainer>
      );
    }

    const config = convenioConfigs[type];
    return (
      <PageContainer>
        <ConvenioFormLayout config={config} />
      </PageContainer>
    );
  }

  // 4. Corrección de convenio existente con datos precargados
  if (!isCreating && mode === 'correccion') {
    if (!isStoreInitialized) {
      return (
        <div className="flex items-center justify-center h-screen w-full">
          <p className="text-muted-foreground animate-pulse">Cargando convenio…</p>
        </div>
      );
    }

    let slug: keyof typeof convenioConfigs | null = null;
    if (type && convenioConfigs[type]) {
      slug = type;
    } else {
      const convenioTypeName = (useConvenioMarcoStore.getState().convenioData as any)?.convenio_types?.name as string | undefined;
      if (convenioTypeName) {
        const normalize = (str: string) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const name = normalize(convenioTypeName.toLowerCase());
        if (name.includes('marco') && name.includes('practica')) slug = 'practica-marco';
        else if (name.includes('marco')) slug = 'marco';
        else if (name.includes('especifico')) slug = 'especifico';
        else if (name.includes('particular')) slug = 'particular';
      }
    }

    if (slug && convenioConfigs[slug]) {
      const config = convenioConfigs[slug];
      return (
        <PageContainer>
          <ConvenioFormLayout config={config} />
        </PageContainer>
      );
    }
  }

  // Si no es un tipo válido, mostrar mensaje de no disponible
  return (
    <PageContainer>
      <div className="flex items-center justify-center h-[60vh]">
        <Card className="w-full max-w-md border-white/10 bg-card/40 backdrop-blur-md">
          <CardContent className="text-center py-8">
            <FileTextIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h2 className="text-xl font-semibold mb-2">Tipo de Convenio No Disponible</h2>
            <p className="text-muted-foreground mb-6">
              {type ?
                `El tipo "${type}" no está disponible actualmente.` :
                "Debe especificar un tipo de convenio válido."
              }
            </p>
            <Link href="/protected">
              <Button variant="outline">
                <ChevronLeftIcon className="h-4 w-4 mr-2" />
                Volver al Inicio
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}