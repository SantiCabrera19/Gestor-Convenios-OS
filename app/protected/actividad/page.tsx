"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/app/protected/admin/data-table";
import { columns } from "./columns";
import { ActivityApiData } from "@/app/api/activity/route";
import { PageContainer } from "@/shared/components/ui/page-container";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { ActivityIcon } from "lucide-react";

export default function ActividadPage() {
  const [activities, setActivities] = useState<ActivityApiData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/activity")
      .then(res => res.json())
      .then((data: ActivityApiData[]) => {
        setActivities(data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching activity:", error);
        setLoading(false);
      });
  }, []);

  return (
    <PageContainer>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            Actividad
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Historial de eventos y cambios en el sistema.
          </p>
        </div>
        <div className="p-3 bg-primary/10 rounded-full">
          <ActivityIcon className="w-6 h-6 text-primary" />
        </div>
      </div>

      <Card className="border-white/10 bg-card/40 backdrop-blur-md shadow-xl">
        <CardHeader>
          <CardTitle>Historial de Eventos</CardTitle>
          <CardDescription>Registro cronológico de todas las acciones.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <div className="h-12 w-full bg-muted/20 rounded-md animate-pulse"></div>
              <div className="h-12 w-full bg-muted/20 rounded-md animate-pulse"></div>
              <div className="h-12 w-full bg-muted/20 rounded-md animate-pulse"></div>
            </div>
          ) : (
            <DataTable columns={columns} data={activities} />
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
