"use client";

import { useSession } from "next-auth/react";
import { signIn, signOut } from "next-auth/react";
import { AppShell } from "./AppShell";

export function AppShellWrapper({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession({
    refetchInterval: 0, // No refetch automático, se actualiza manualmente
    refetchOnWindowFocus: true, // Refetch cuando la ventana recupera el foco
  });

  async function signInAction() {
    await signIn("google");
  }

  async function signOutAction() {
    await signOut();
  }

  if (status === "loading") {
    return <div>Cargando...</div>;
  }

  return (
    <AppShell
      session={session}
      signInAction={signInAction}
      signOutAction={signOutAction}
    >
      {children}
    </AppShell>
  );
}

