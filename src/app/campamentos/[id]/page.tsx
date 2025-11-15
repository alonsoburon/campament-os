import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/app/components/ui/tabs";
import ParticipantsTab from "~/app/components/Camps/ParticipantsTab";
import { api } from "~/trpc/react";
import { useOrganization } from "~/app/hooks/useOrganization"; // Importar useOrganization
import { Card, CardContent, CardHeader, CardTitle } from "~/app/components/ui/card";
import { Label } from "~/app/components/ui/label";
import { Button } from "~/app/components/ui/button";
import { Edit } from "lucide-react";

interface CampamentoDetailPageProps {
  params: { id: string };
}

const CampamentoDetailPage = ({ params }: CampamentoDetailPageProps) => {
  const campId = parseInt(params.id);
  const { organizationId, isLoading: isOrganizationLoading, error: organizationError } = useOrganization();

  const { data: camp, isLoading, error } = api.camp.getCampById.useQuery(
    { id: campId, organizationId: organizationId! },
    { enabled: !!organizationId && !isNaN(campId) && !isOrganizationLoading }
  );

  if (isLoading || isOrganizationLoading) {
    return <div className="container mx-auto p-4">Cargando detalle del campamento...</div>;
  }

  if (organizationError) {
    return <div className="container mx-auto p-4 text-red-500">Error de autenticación: {organizationError.message}</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">Error al cargar el campamento: {error.message}</div>;
  }

  if (!organizationId) {
    return <div className="container mx-auto p-4 text-red-500">No se pudo obtener la organización. Por favor, inicia sesión.</div>;
  }

  if (!camp) {
    return <div className="container mx-auto p-4">Campamento no encontrado.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Detalle del Campamento: {camp.name}</h1>
        <Button variant="outline">
          <Edit className="mr-2 h-4 w-4" />
          Editar Campamento
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Información General</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Ubicación:</Label>
            <p>{camp.location}</p>
          </div>
          <div>
            <Label>Inicio:</Label>
            <p>{new Date(camp.start_date).toLocaleDateString()}</p>
          </div>
          <div>
            <Label>Fin:</Label>
            <p>{new Date(camp.end_date).toLocaleDateString()}</p>
          </div>
          <div>
            <Label>Costo:</Label>
            <p>${camp.fee_cost.toFixed(2)}</p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Descripción General</TabsTrigger>
          <TabsTrigger value="participants">Participantes</TabsTrigger>
          <TabsTrigger value="settings">Ajustes</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <Card>
            <CardContent className="p-4">
              <p>Aquí puedes ver más detalles sobre el campamento.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="participants">
          <ParticipantsTab campId={params.id} />
        </TabsContent>
        <TabsContent value="settings">
          <Card>
            <CardContent className="p-4">
              <p>Aquí puedes configurar los ajustes del campamento.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CampamentoDetailPage;
