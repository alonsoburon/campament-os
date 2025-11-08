import { auth, signIn, signOut } from "~/server/auth";
import { HydrateClient } from "~/trpc/server";

import { AppShell } from "./components/AppShell";

export default async function Home() {
  const session = await auth();

  return (
    <HydrateClient>
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <header className="border-b border-border bg-card/80 backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-6 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-semibold text-primary md:text-3xl">
                CapamentOS · Panel Explorador
              </h1>
              <p className="text-sm text-muted-foreground">
                Orquesta campamentos, personas, logística y presupuesto desde un solo lugar.
              </p>
            </div>
            <div className="flex flex-col items-start gap-3 md:items-end">
              <p className="text-sm">
                {session ? (
                  <span>
                    Sesión iniciada · {session.user?.name ?? "Sin nombre"} | {session.user?.email}
                  </span>
                ) : (
                  <span>No has iniciado sesión</span>
                )}
              </p>
              <form
                action={async () => {
                  "use server";
                  if (session) {
                    await signOut();
                  } else {
                    await signIn("google");
                  }
                }}
              >
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-m transition hover:bg-scout-500"
                >
                  {session ? "Cerrar sesión" : "Iniciar sesión con Google"}
                </button>
              </form>
            </div>
          </div>
        </header>
        <div className="flex flex-1">
          <AppShell />
        </div>
      </div>
    </HydrateClient>
  );
}
