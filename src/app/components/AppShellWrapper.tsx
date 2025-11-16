"use client";

import { useSession } from "~/lib/auth-client";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { AppShell } from "./AppShell";

export function AppShellWrapper({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  // TODO: Reactivar verificación de person_id cuando la sesión se refresque correctamente
  // useEffect(() => {
  //   if (session && !isPending && !session.user?.person_id && !pathname.startsWith("/onboarding")) {
  //     router.push("/onboarding/create-person");
  //   }
  // }, [session, isPending, router, pathname]);

  if (isPending) {
    return <div>Cargando...</div>;
  }

  // If on login or onboarding page, don't use AppShell (it requires authentication/person_id)
  if (pathname.startsWith("/login") || pathname.startsWith("/onboarding")) {
    return <>{children}</>;
  }

  return (
    <AppShell session={session}>
      {children}
    </AppShell>
  );
}

