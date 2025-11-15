"use client";
import React from 'react';
import { api } from "~/trpc/react";
import { useOrganization } from "~/app/hooks/useOrganization"; // Importar useOrganization
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "~/app/components/ui/card";
import { Button } from "~/app/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/app/components/ui/table";
import { PlusCircle } from "lucide-react";

const CampamentosPage = () => {
  const { organizationId, isLoading: isOrganizationLoading, error: organizationError } = useOrganization();

  const { data: camps, isLoading, error } = api.camp.listCamps.useQuery(
    { organizationId: organizationId! },
    { enabled: !!organizationId && !isOrganizationLoading }
  );

  if (isLoading || isOrganizationLoading) {
    return <div className="container mx-auto p-4">Cargando campamentos...</div>;
  }

  if (organizationError) {
    return <div className="container mx-auto p-4 text-red-500">Error de autenticación: {organizationError.message}</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">Error al cargar campamentos: {error.message}</div>;
  }

  if (!organizationId) {
    return <div className="container mx-auto p-4 text-red-500">No se pudo obtener la organización. Por favor, inicia sesión.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Lista de Campamentos</h1>
        <Button asChild>
          <Link href="/campamentos/nuevo">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuevo Campamento
          </Link>
        </Button>
      </div>

      {/* Placeholder para filtros */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtros de Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div>Aquí irán los filtros</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Campamentos Disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          {camps && camps.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead>Inicio</TableHead>
                  <TableHead>Fin</TableHead>
                  <TableHead className="text-right">Costo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {camps.map((camp) => (
                  <TableRow key={camp.id}>
                    <TableCell className="font-medium">
                      <Link href={`/campamentos/${camp.id}`} className="text-blue-600 hover:underline">
                        {camp.name}
                      </Link>
                    </TableCell>
                    <TableCell>{camp.location}</TableCell>
                    <TableCell>{new Date(camp.start_date).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(camp.end_date).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">${camp.fee_cost.toFixed(2)}</TableCell>
                  </TableRow>
                ))
              }</TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground">No hay campamentos disponibles.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CampamentosPage;
