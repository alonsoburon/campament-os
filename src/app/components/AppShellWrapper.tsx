"use client";

import { useSession } from "~/lib/auth-client";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { AppShell } from "./AppShell";

export function AppShellWrapper({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If user doesn't have a person_id, redirect to create person page
    // BUT only if not already on an onboarding page
    if (session && !isPending && !session.user?.person_id && !pathname.startsWith("/onboarding")) {
      router.push("/onboarding/create-person");
    }
  }, [session, isPending, router, pathname]);

  if (isPending) {
    return <div>Cargando...</div>;
  }

  // Don't render AppShell if user doesn't have a person AND not on onboarding page
  if (session && !session.user?.person_id && !pathname.startsWith("/onboarding")) {
    return <div>Redirigiendo...</div>;
  }

  // If on onboarding page, don't use AppShell (it requires person_id)
  if (pathname.startsWith("/onboarding")) {
    return <>{children}</>;
  }

  return (
    <AppShell session={session}>
      {children}
    </AppShell>
  );
}

