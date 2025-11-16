/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import React, { useState } from 'react';
import { api } from "~/trpc/react";
import { useOrganization } from "~/app/hooks/useOrganization"; // Importar useOrganization
import { Input } from "~/app/components/ui/input";
import { Button } from "~/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/app/components/ui/card";
import { CircleUser, PlusCircle } from "lucide-react";

interface ParticipantsTabProps {
  campId: string;
}

const ParticipantsTab = ({ campId }: ParticipantsTabProps) => {
  const campIdNum = parseInt(campId);
  const { organizationId, isLoading: isOrganizationLoading, error: organizationError } = useOrganization();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPerson, setSelectedPerson] = useState<{ id: number; full_name: string } | null>(null);

  const { data: participants, isLoading: isLoadingParticipants, error: participantsError, refetch: refetchParticipants } = api.camp.listParticipations.useQuery(
    { campId: campIdNum, organizationId: organizationId! },
    { enabled: !!organizationId && !isNaN(campIdNum) && !isOrganizationLoading }
  );
  const { data: searchResults, isLoading: isLoadingSearchResults, error: searchError } = api.person.searchPersons.useQuery(
    { query: searchTerm, organizationId: organizationId! },
    { enabled: !!organizationId && searchTerm.length > 2 && !isOrganizationLoading }
  );

  const addParticipantMutation = api.person.addParticipantToCamp.useMutation({
    onSuccess: () => {
      void refetchParticipants();
      setSearchTerm("");
      setSelectedPerson(null);
      alert("Participante añadido con éxito!");
    },
    onError: (err) => {
      alert(`Error al añadir participante: ${err.message}`);
    },
  });

  const handleAddParticipant = () => {
    if (selectedPerson && organizationId) {
      addParticipantMutation.mutate({ personId: selectedPerson.id, campId: campIdNum, organizationId });
    }
  };

  if (isOrganizationLoading) return <div className="p-4">Cargando contexto de organización...</div>;
  if (organizationError) return <div className="p-4 text-red-500">Error de autenticación: {organizationError.message}</div>;
  if (!organizationId) return <div className="p-4 text-red-500">No se pudo obtener la organización.</div>;
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Añadir Participante</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2 mb-4">
            <Input
              type="text"
              placeholder="Buscar persona por nombre..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setSelectedPerson(null);
              }}
              className="flex-1"
            />
            <Button
              onClick={handleAddParticipant}
              disabled={!selectedPerson || addParticipantMutation.isPending}
            >
              {addParticipantMutation.isPending ? "Añadiendo..." : (<><PlusCircle className="mr-2 h-4 w-4" />Añadir</>)}
            </Button>
          </div>

          {isLoadingSearchResults && <p className="text-sm text-muted-foreground">Buscando...</p>}
          {searchError && <p className="text-sm text-destructive">Error al buscar: {searchError.message}</p>}
          {searchResults && searchResults.length > 0 && !selectedPerson && ( 
            <ul className="border rounded-md max-h-40 overflow-y-auto bg-card shadow-sm">
              {searchResults.map((person) => (
                <li
                  key={person.id}
                  onClick={() => setSelectedPerson(person)}
                  className="p-2 cursor-pointer hover:bg-accent hover:text-accent-foreground"
                >
                  {person.full_name}
                </li>
              ))}
            </ul>
          )}
          {selectedPerson && <p className="mt-2 text-sm">Seleccionado: <span className="font-medium">{selectedPerson.full_name}</span></p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Participantes</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingParticipants && <p>Cargando participantes...</p>}
          {participantsError && <p className="text-red-500">Error: {participantsError.message}</p>}
          {participants && participants.length === 0 && <p className="text-muted-foreground">No hay participantes en este campamento.</p>}
          {participants?.map((participation) => (
            <li key={participation.person.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50">
              <CircleUser className="h-5 w-5 text-muted-foreground" />
              <span>{participation.person.full_name}</span>
              <span className={`text-sm font-medium ${participation.payment_made ? "text-green-600" : "text-orange-600"}`}>
                ({participation.payment_made ? "Pagado" : "Pendiente"})
              </span>
            </li>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default ParticipantsTab;
