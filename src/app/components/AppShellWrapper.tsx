"use client";

import { useSession, signIn, signOut } from "~/lib/auth-client";
import { AppShell } from "./AppShell";

export function AppShellWrapper({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession({
    refetchInterval: 0,
    refetchOnWindowFocus: true,
  });

  if (status === "loading") {
    return <div>Cargando...</div>;
  }

  return (
    <AppShell session={session}>
      {children}
    </AppShell>
  );
}

