"use client";

import { useSearchParams, useParams } from 'next/navigation';
import { ChevronLeftIcon, FileTextIcon, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/shared/components/ui/button";
import { ConvenioInfoDisplay } from "@/features/agreements/components/layout/convenio-info-display";
import { useConvenioMarcoStore } from "@/stores/convenioMarcoStore";
import { DynamicConvenioPage } from "@/features/agreements/components/forms/dynamic/DynamicConvenioPage";
import { PageContainer } from "@/shared/components/ui/page-container";
import { Card, CardContent } from "@/shared/components/ui/card";

/**
 * Unified Convenio Page - All forms are now DYNAMIC
 * 
 * Modes:
 * - /convenio-detalle/nuevo?type=X  → Create new convenio using dynamic form
 * - /convenio-detalle/[id]          → View existing convenio (read-only)
 * - /convenio-detalle/[id]?mode=correccion → Edit convenio in correction mode
 */
export default function ConvenioPage() {
  const params = useParams<{ id: string }>();
  const paramId = params.id;
  const isCreating = paramId === "nuevo";
  const searchParams = useSearchParams();
  const type = searchParams.get('type');
  const mode = searchParams.get('mode');

  const initializeStore = useConvenioMarcoStore((state) => state.initialize);
  const isStoreInitialized = useConvenioMarcoStore((state) => state.isInitialized);
  const convenioData = useConvenioMarcoStore((state) => state.convenioData);

  // State for fetching convenio type info
  const [convenioTypeId, setConvenioTypeId] = useState<number | null>(null);
  const [convenioTitle, setConvenioTitle] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  // Load convenio data for editing or viewing
  useEffect(() => {
    if (isCreating) {
      // For new convenios, we need to fetch the type ID from the type slug
      fetchTypeIdFromSlug(type);
    } else if (paramId) {
      // For existing convenios, fetch their data
      fetchConvenioData(paramId);
    }
  }, [isCreating, paramId, type]);

  // Initialize store for correction mode
  useEffect(() => {
    if (!isCreating && mode === 'correccion' && paramId) {
      initializeStore(paramId as any);
    }
  }, [isCreating, mode, paramId, initializeStore]);

  async function fetchTypeIdFromSlug(slug: string | null) {
    if (!slug) {
      setIsLoading(false);
      return;
    }

    try {
      // Fetch form_definitions to get the type ID
      const response = await fetch(`/api/admin/forms?slug=${encodeURIComponent(slug)}`);
      if (response.ok) {
        const forms = await response.json();
        if (forms && forms.length > 0) {
          setConvenioTypeId(forms[0].id);
          setConvenioTitle(forms[0].name || `Nuevo ${slug}`);
        }
      }
    } catch (error) {
      console.error("Error fetching form definition:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchConvenioData(id: string) {
    try {
      const response = await fetch(`/api/convenios/${id}`);
      if (response.ok) {
        const data = await response.json();
        setConvenioTypeId(data.convenio_type_id);
        setConvenioTitle(data.title || "Convenio");
      }
    } catch (error) {
      console.error("Error fetching convenio:", error);
    } finally {
      setIsLoading(false);
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">Cargando...</p>
        </div>
      </PageContainer>
    );
  }

  // VIEW MODE: Existing convenio (read-only)
  if (!isCreating && mode !== 'correccion') {
    return (
      <PageContainer>
        <ConvenioInfoDisplay convenioId={paramId} />
      </PageContainer>
    );
  }

  // CREATE MODE: New convenio with dynamic form
  if (isCreating && type) {
    if (!convenioTypeId) {
      // Type not found - show error
      return (
        <PageContainer>
          <div className="flex items-center justify-center h-[60vh]">
            <Card className="w-full max-w-md border-white/10 bg-card/40 backdrop-blur-md">
              <CardContent className="text-center py-8">
                <FileTextIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <h2 className="text-xl font-semibold mb-2">Plantilla No Encontrada</h2>
                <p className="text-muted-foreground mb-6">
                  No se encontró la plantilla "{type}". Es posible que no exista o no esté activa.
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

    return (
      <PageContainer>
        <DynamicConvenioPage
          convenioTypeId={convenioTypeId}
          title={convenioTitle}
          slug={type}
        />
      </PageContainer>
    );
  }

  // CORRECTION MODE: Edit existing convenio with dynamic form
  if (!isCreating && mode === 'correccion') {
    if (!isStoreInitialized) {
      return (
        <div className="flex items-center justify-center h-screen w-full">
          <Loader2 className="h-10 w-10 animate-spin text-primary mr-3" />
          <p className="text-muted-foreground animate-pulse">Cargando convenio para corrección...</p>
        </div>
      );
    }

    const typeIdFromStore = (convenioData as any)?.convenio_type_id || convenioTypeId;
    const titleFromStore = (convenioData as any)?.title || convenioTitle || 'Corrección de Convenio';

    // Extract form_data for pre-filling (form fields are stored here)
    const formDataForPrefill = (convenioData as any)?.form_data ||
      (convenioData as any)?.content_data ||
      convenioData || {};

    return (
      <PageContainer>
        <DynamicConvenioPage
          convenioTypeId={typeIdFromStore || 0}
          title={`Corregir: ${titleFromStore}`}
          slug={type || 'correccion'}
          initialData={formDataForPrefill}
        />
      </PageContainer>
    );
  }

  // FALLBACK: No valid mode/type
  return (
    <PageContainer>
      <div className="flex items-center justify-center h-[60vh]">
        <Card className="w-full max-w-md border-white/10 bg-card/40 backdrop-blur-md">
          <CardContent className="text-center py-8">
            <FileTextIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h2 className="text-xl font-semibold mb-2">Selecciona una Plantilla</h2>
            <p className="text-muted-foreground mb-6">
              Para crear un nuevo convenio, selecciona una plantilla desde el dashboard.
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