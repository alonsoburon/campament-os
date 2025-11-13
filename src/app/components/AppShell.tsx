"use client";

import * as React from "react";
import type { Session } from "next-auth";

import { api } from "~/trpc/react";

import { ColorSystemPreview } from "./ColorSystemPreview";
import { Dashboard } from "./Dashboard";
import { PageHeader } from "./PageHeader";
import { Sidebar } from "./Sidebar";

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
  signInAction: () => Promise<void>;
  signOutAction: () => Promise<void>;
};

export function AppShell({
  session,
  signInAction,
  signOutAction,
}: AppShellProps) {
  const [currentModule, setCurrentModule] =
    React.useState<string>(DEFAULT_MODULE);
  const [showColorSystem, setShowColorSystem] = React.useState<boolean>(true);

  const {
    data: contextData,
    isLoading: contextLoading,
  } = api.organization.getCurrentContext.useQuery(undefined, {
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const allowedModules = React.useMemo(() => {
    const serverModules = contextData?.allowedModules ?? null;
    const fallback = ALL_MODULE_IDS as unknown as string[];
    if (!serverModules || serverModules.length === 0) {
      return fallback;
    }
    return Array.from(new Set(["inicio", ...serverModules])) as string[];
  }, [contextData?.allowedModules]);

  React.useEffect(() => {
    if (!allowedModules.includes(currentModule)) {
      const fallbackModule = allowedModules[0] ?? DEFAULT_MODULE;
      setCurrentModule(fallbackModule);
    }
  }, [allowedModules, currentModule]);

  const currentTitle = React.useMemo(() => {
    if (showColorSystem) {
      return "Sistema de colores";
    }

    return currentModule === "inicio"
      ? "Panel general"
      : currentModule.replace(/-/g, " ");
  }, [currentModule, showColorSystem]);

  return (
    <div className="app-shell-container">
      {/* Sidebar - Fixed position with floating effect */}
      <aside className="app-shell-sidebar">
        <Sidebar
          currentModule={currentModule}
          onModuleChange={setCurrentModule}
          onToggleColorSystem={() =>
            setShowColorSystem((previous) => !previous)
          }
          showColorSystem={showColorSystem}
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
          signInAction={signInAction}
          signOutAction={signOutAction}
          organizationName={contextData?.organization?.name ?? undefined}
          roleName={contextData?.role?.name ?? undefined}
        />
      </header>

      {/* Main Content - Floating container with rounded corners */}
      <div className="app-shell-content">
        <main className="app-shell-content-inner">
          {showColorSystem ? (
            <ColorSystemPreview onClose={() => setShowColorSystem(false)} />
          ) : (
            <Dashboard currentModule={currentModule} />
          )}
        </main>
      </div>
    </div>
  );
}
