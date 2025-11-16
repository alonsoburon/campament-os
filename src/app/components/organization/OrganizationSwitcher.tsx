"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { authClient } from "~/lib/auth-client";
import { Button } from "~/app/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "~/app/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/app/components/ui/popover";
import { useRouter } from "next/navigation";
import { cn } from "~/lib/utils";

type Organization = {
  id: string;
  name: string;
  slug?: string | null;
  logo?: string | null;
  metadata?: Record<string, any> | null;
  createdAt: Date;
};

/**
 * Componente para cambiar entre organizaciones
 * Usa el plugin de organización de better-auth
 */
export function OrganizationSwitcher() {
  const [open, setOpen] = React.useState(false);
  const [organizations, setOrganizations] = React.useState<Organization[]>([]);
  const [activeOrgId, setActiveOrgId] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const router = useRouter();

  // Cargar organizaciones del usuario
  React.useEffect(() => {
    const loadOrganizations = async () => {
      try {
        setIsLoading(true);

        // Listar organizaciones del usuario usando better-auth
        const { data } = await authClient.organization.list({});

        if (data) {
          setOrganizations(data as Organization[]);
        }

        // Obtener organización activa desde la sesión
        const { data: session } = await authClient.getSession();
        if (session?.session) {
          const activeOrg = (session.session as any).activeOrganizationId;
          setActiveOrgId(activeOrg);
        }
      } catch (error) {
        console.error("Error cargando organizaciones:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void loadOrganizations();
  }, []);

  const handleSelectOrganization = async (orgId: string) => {
    try {
      // Cambiar organización activa usando better-auth
      await authClient.organization.setActive({
        organizationId: orgId,
      });

      setActiveOrgId(orgId);
      setOpen(false);

      // Recargar la página para refrescar el contexto
      router.refresh();
    } catch (error) {
      console.error("Error cambiando organización:", error);
    }
  };

  const handleCreateOrganization = () => {
    setOpen(false);
    router.push("/onboarding/create-organization");
  };

  const activeOrganization = organizations.find((org) => org.id === activeOrgId);

  if (isLoading) {
    return (
      <Button variant="outline" size="sm" className="w-[200px]" disabled>
        <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        Cargando...
      </Button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Seleccionar organización"
          className="w-[200px] justify-between"
        >
          {activeOrganization ? (
            <div className="flex items-center gap-2">
              {activeOrganization.logo && (
                <img
                  src={activeOrganization.logo}
                  alt={activeOrganization.name}
                  className="h-5 w-5 rounded-sm"
                />
              )}
              <span className="truncate">{activeOrganization.name}</span>
            </div>
          ) : (
            <span>Seleccionar organización</span>
          )}
          <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Buscar organización..." />
          <CommandList>
            <CommandEmpty>No se encontraron organizaciones.</CommandEmpty>
            <CommandGroup heading="Organizaciones">
              {organizations.map((org) => (
                <CommandItem
                  key={org.id}
                  onSelect={() => handleSelectOrganization(org.id)}
                  className="text-sm"
                >
                  <div className="flex items-center gap-2">
                    {org.logo && (
                      <img
                        src={org.logo}
                        alt={org.name}
                        className="h-5 w-5 rounded-sm"
                      />
                    )}
                    <span className="truncate">{org.name}</span>
                  </div>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      activeOrgId === org.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup>
              <CommandItem onSelect={handleCreateOrganization}>
                <Plus className="mr-2 h-4 w-4" />
                Crear organización
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
