"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        pageTitle="Configuración"
        pageDes="Configura las preferencias de tu negocio."
      />

      <Card>
        <CardHeader>
          <CardTitle>Configuración del Negocio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
            <div className="text-center">
              <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold">Panel de Configuración</h3>
              <p className="text-muted-foreground">Las opciones de configuración se implementarán aquí</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
