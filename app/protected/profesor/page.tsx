"use client";

import { useState, useEffect } from "react";
import { ProfesorPanelClient } from "./ProfesorPanelClient";
import { PageContainer } from "@/app/components/ui/page-container";
import { GraduationCapIcon } from "lucide-react";

export default function ProfesorPage() {
  const [convenios, setConvenios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        const res = await fetch("/api/convenios?limit=1000&full=true");
        if (!res.ok) {
          throw new Error("Error al cargar convenios");
        }
        const conveniosData = await res.json();

        setConvenios(conveniosData || []);
        console.log("Convenios cargados:", conveniosData?.length);
      } catch (e) {
        console.error("Error:", e);
        setError(e);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <PageContainer>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="space-y-1">
            <div className="h-8 w-48 bg-muted/20 rounded-md animate-pulse"></div>
            <div className="h-4 w-64 bg-muted/20 rounded-md animate-pulse"></div>
          </div>
        </div>
        <div className="h-96 w-full bg-muted/10 rounded-xl animate-pulse"></div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <div className="text-center py-16 text-destructive">
          <p className="text-lg font-semibold">Error al cargar los convenios</p>
          <p className="text-sm mt-2">Por favor, intenta recargar la página</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            Panel Académico
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Visualiza y filtra los convenios académicos del sistema.
          </p>
        </div>
        <div className="p-3 bg-primary/10 rounded-full">
          <GraduationCapIcon className="w-6 h-6 text-primary" />
        </div>
      </div>
      <ProfesorPanelClient convenios={convenios} />
    </PageContainer>
  );
}