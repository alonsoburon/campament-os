"use client";

import * as React from "react";
import type { Session } from "next-auth";

import { ColorSystemPreview } from "./ColorSystemPreview";
import { Dashboard } from "./Dashboard";
import { PageHeader } from "./PageHeader";
import { Sidebar } from "./Sidebar";

const DEFAULT_MODULE = "inicio";

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
        />
      </aside>

      {/* Top Bar - Fixed position with floating effect */}
      <header className="app-shell-topbar">
        <PageHeader
          title={currentTitle}
          badgeLabel="Versión Alpha"
          description="CapamentOS prioriza información clara y organizada para que administres tus campamentos sin distracciones."
          session={session}
          signInAction={signInAction}
          signOutAction={signOutAction}
        />
      </header>

      {/* Main Content - Floating container with rounded corners */}
      <main className="app-shell-content">
        {showColorSystem ? (
          <ColorSystemPreview onClose={() => setShowColorSystem(false)} />
        ) : (
          <Dashboard currentModule={currentModule} />
        )}
      </main>
    </div>
  );
}
