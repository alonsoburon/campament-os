import Link from "next/link";

import { auth, signIn, signOut } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";

export default async function Home() {
  const session = await auth();

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            CapamentOS
          </h1>
          <div className="flex flex-col items-center gap-2">
            <div className="flex flex-col items-center justify-center gap-4">
              <p className="text-center text-2xl text-white">
                {session ? (
                  <span>
                    Sesión iniciada como {session.user?.name} | {session.user?.email}
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
                  className="rounded-lg bg-white px-6 py-3 text-base font-semibold text-[#2e026d] transition hover:bg-gray-200"
                >
                  {session ? "Cerrar sesión" : "Iniciar sesión con Google"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
