import { auth, signIn, signOut } from "~/server/auth"; // Necesario para la sesión y acciones
import { HydrateClient } from "~/trpc/server";
import { AppShell } from "./components/AppShell";

export default async function Home() {
  // 1. OBTENEMOS LOS DATOS EN EL SERVIDOR
  const session = await auth();

  // 2. DEFINIMOS LAS SERVER ACTIONS EN EL SERVIDOR
  async function signInAction() {
    "use server";
    await signIn("google");
  }

  async function signOutAction() {  
    "use server";
    await signOut();
  }

  return (
    <HydrateClient>
      <AppShell
        session={session}
        signInAction={signInAction}
        signOutAction={signOutAction}
      />
    </HydrateClient>
  );
}