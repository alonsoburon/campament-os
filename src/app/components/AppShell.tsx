"use client";

import * as React from "react";

import { ColorSystemPreview } from "./ColorSystemPreview";
import { Dashboard } from "./Dashboard";
import { Sidebar } from "./Sidebar";

const DEFAULT_MODULE = "inicio";

export function AppShell() {
  const [currentModule, setCurrentModule] =
    React.useState<string>(DEFAULT_MODULE);
  const [showColorSystem, setShowColorSystem] = React.useState<boolean>(true);

  return (
    <div className="flex min-h-[calc(100vh-5.5rem)] w-full bg-muted/20">
      <Sidebar
        currentModule={currentModule}
        onModuleChange={setCurrentModule}
        onToggleColorSystem={() =>
          setShowColorSystem((previous) => !previous)
        }
        showColorSystem={showColorSystem}
      />

      <main className="flex flex-1 flex-col overflow-y-auto bg-background text-foreground">
        {showColorSystem ? (
          <ColorSystemPreview onClose={() => setShowColorSystem(false)} />
        ) : (
          <Dashboard currentModule={currentModule} />
        )}
      </main>
    </div>
  );
}

