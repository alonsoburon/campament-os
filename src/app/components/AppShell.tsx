"use client";

import * as React from "react";
import type { Session } from "@better-auth/next";
import { useRouter, usePathname } from "next/navigation";

import { api } from "~/trpc/react";

import { Dashboard } from "./Dashboard";
import { PageHeader } from "./PageHeader";
import { Sidebar } from "./Sidebar";
import { OrganizationContext } from "~/app/hooks/useOrganization"; // Importar OrganizationContext

const DEFAULT_MODULE = "inicio";
const ALL_MODULE_IDS = [
  "inicio",
  "campamentos",
  "personas",
  "inventario",
  "alimentacion",
  "transporte",
  "alojamiento",
  "actividades",
  "salud",
  "tareas",
  "presupuesto",
  "reportes",
  "configuracion",
] as const;

type AppShellProps = {
  session: Session | null;
  children: React.ReactNode;
};

export function AppShell({
  session,
  children,
}: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  // Detectar el módulo actual desde la ruta
  const detectedModule = React.useMemo(() => {
    if (pathname === "/" || pathname === "/inicio") return "inicio";
    const segments = pathname.split("/").filter(Boolean);
    return segments[0] ?? DEFAULT_MODULE;
  }, [pathname]);

  const [currentModule, setCurrentModule] =
    React.useState<string>(detectedModule);

  // Sincronizar currentModule con la ruta
  React.useEffect(() => {
    setCurrentModule(detectedModule);
  }, [detectedModule]);

  const {
    data: contextData,
    isLoading: contextLoading,
    error: contextError,
  } = api.organization.getCurrentContext.useQuery(undefined, {
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const organizationContextValue = React.useMemo(() => {
    if (contextLoading || !contextData) {
      return {
        organizationId: undefined,
        organizationName: undefined,
        roleName: undefined,
        isLoading: true,
        error: contextError,
      };
    }
    return {
      organizationId: contextData.organization?.id,
      organizationName: contextData.organization?.name,
      roleName: contextData.role?.name,
      isLoading: false,
      error: null,
    };
  }, [contextData, contextLoading, contextError]);

  const allowedModules = React.useMemo(() => {
    if (contextLoading || !contextData) {
      return ALL_MODULE_IDS as unknown as string[];
    }
    const serverModules = contextData.allowedModules ?? [];
    return Array.from(new Set(["inicio", ...serverModules]));
  }, [contextData, contextLoading]);

  React.useEffect(() => {
    if (!allowedModules.includes(currentModule)) {
      const fallbackModule = allowedModules[0] ?? DEFAULT_MODULE;
      setCurrentModule(fallbackModule);
    }
  }, [allowedModules, currentModule]);

  const currentTitle = React.useMemo(() => {
    return currentModule === "inicio"
      ? "Panel general"
      : currentModule.replace(/-/g, " ");
  }, [currentModule]);

  const handleModuleChange = (moduleId: string) => {
    setCurrentModule(moduleId);
    router.push(`/${moduleId}`);
  };

  if (contextLoading) {
    return <div>Cargando...</div>; // O un componente de esqueleto más sofisticado
  }

  if (contextError) {
    return <div>Error al cargar el contexto: {contextError.message}</div>;
  }

  if (!contextData) {
    return <div>No se encontró el contexto de la organización.</div>;
  }
  
  return (
    <div className="app-shell-container">
      <OrganizationContext.Provider value={organizationContextValue}>
        {/* Sidebar - Fixed position with floating effect */}
        <aside className="app-shell-sidebar">
          <Sidebar
            currentModule={currentModule}
            onModuleChange={handleModuleChange}
            allowedModules={allowedModules}
            isLoading={contextLoading}
          />
        </aside>

        {/* Top Bar - Fixed position with floating effect */}
        <header className="app-shell-topbar">
          <PageHeader
            title={currentTitle}
            description="CampamentOS prioriza información clara y organizada para que administres tus campamentos sin distracciones."
            session={session}
            organizationName={contextData.organization?.name ?? undefined}
            roleName={contextData.role?.name ?? undefined}
          />
        </header>

        {/* Main Content - Floating container with rounded corners */}
        <div className="app-shell-content">
          <main className="app-shell-content-inner">
            {pathname === "/" || pathname === "/inicio" ? (
              <Dashboard currentModule={currentModule} />
            ) : (
              children
            )}
          </main>
        </div>
      </OrganizationContext.Provider> {/* Cerrar el Provider */}
    </div>
  );
}
