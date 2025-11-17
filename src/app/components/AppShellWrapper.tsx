"use client";

import { useSession } from "~/lib/auth-client";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { AppShell } from "./AppShell";
import { Skeleton } from "./ui/skeleton";

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
    return (
      <div className="app-shell-container">
        <aside className="app-shell-sidebar p-4 space-y-4">
          <Skeleton className="h-10 w-40" />
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </aside>
        <header className="app-shell-topbar">
          <div className="flex w-full items-center justify-between p-4">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-9 w-32" />
          </div>
        </header>
        <div className="app-shell-content">
          <main className="app-shell-content-inner p-6">
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          </main>
        </div>
      </div>
    );
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

