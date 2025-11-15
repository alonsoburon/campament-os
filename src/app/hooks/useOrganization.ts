import { createContext, useContext } from "react";

interface OrganizationContextType {
  organizationId: number | undefined;
  organizationName: string | undefined;
  roleName: string | undefined;
  allowedModules: string[] | undefined;
  isLoading: boolean;
  error: Error | null;
}

export const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    // Retornar valores por defecto en lugar de lanzar error
    return {
      organizationId: undefined,
      organizationName: undefined,
      roleName: undefined,
      allowedModules: undefined,
      isLoading: true,
      error: null,
    };
  }
  return context;
}
