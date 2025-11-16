"use client";

import * as React from "react";
import type { Session } from "@better-auth/next";
import { signIn, signOut } from "~/lib/auth-client";
import { LogOut, LogIn, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { ThemeToggle } from "./ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { api } from "~/trpc/react";

type PageHeaderProps = {
  title: string;
  description?: string;
  badgeLabel?: string;
  session: Session | null;
  organizationName?: string;
  roleName?: string;
};

export function PageHeader({
  title,
  description,
  badgeLabel,
  session,
  organizationName,
  roleName,
}: PageHeaderProps) {
  const router = useRouter();
  const utils = api.useUtils();
  const [switchingUserId, setSwitchingUserId] = React.useState<string | null>(
    null,
  );
  const [switchError, setSwitchError] = React.useState<string | null>(null);
  const [isRefreshing, startTransition] = React.useTransition();
  const devSwitchEnabled = process.env.NODE_ENV !== "production";

  const {
    data: switchableUsers,
    isLoading: switchableUsersLoading,
  } = api.user.listSwitchableUsers.useQuery(undefined, {
    enabled: devSwitchEnabled,
    refetchOnWindowFocus: false,
  });

  const contextLabel = React.useMemo(() => {
    return [roleName, organizationName].filter(Boolean).join(" • ");
  }, [organizationName, roleName]);

  const handleSwitchUser = React.useCallback(
    async (userId: string) => {
      if (!devSwitchEnabled) return;

      setSwitchError(null);
      setSwitchingUserId(userId);

      try {
        // Usar signIn con el proveedor de credenciales para personificación en dev
        const result = await signIn("credentials", {
          redirect: false, // Evitar recarga completa de la página
          userId,
        });

        if (result?.error) {
          throw new Error("El cambio de sesión falló. Revisa la consola.");
        }

        // Invalidar toda la caché de tRPC y refrescar la página
        await utils.invalidate();
        startTransition(() => {
          router.refresh();
        });
      } catch (error) {
        console.error("Error al cambiar de usuario:", error);
        setSwitchError(
          error instanceof Error
            ? error.message
            : "No se pudo cambiar de usuario.",
        );
      } finally {
        setSwitchingUserId(null);
      }
    },
    [devSwitchEnabled, router, startTransition, utils],
  );

  const renderMembershipSummary = React.useCallback(
    (memberships: {
      organizationName: string;
      roleName: string;
    }[]) => {
      if (!memberships || memberships.length === 0) {
        return "Sin organización asignada";
      }

      const primary = memberships[0];
      if (!primary) {
        return "Sin organización asignada";
      }

      const additionalCount = memberships.length - 1;

      return [
        `${primary.roleName} • ${primary.organizationName}`,
        additionalCount > 0 ? `+${additionalCount} asignaciones` : null,
      ]
        .filter(Boolean)
        .join(" · ");
    },
    [],
  );

  return (
    <div className="flex w-full items-center justify-between gap-6 px-8">
      {/* Título y descripción */}
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          {badgeLabel && (
            <span className="rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-medium text-accent-foreground">
              {badgeLabel}
            </span>
          )}
        </div>
        {description && (
          <p className="text-sm text-muted-foreground max-w-2xl">
            {description}
          </p>
        )}
        {contextLabel && (
          <p className="text-xs text-muted-foreground/80">
            {contextLabel}
          </p>
        )}
      </div>

      {/* Acciones del header */}
      <div className="flex items-center gap-3">
        {/* Toggle de tema */}
        <ThemeToggle />

        {/* Menú de usuario */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full hover:bg-accent"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-neutral-900 to-neutral-700 text-xs font-semibold text-white dark:from-neutral-100 dark:to-neutral-300 dark:text-neutral-900">
                {session?.user?.name?.[0]?.toUpperCase() ?? "U"}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="profile-menu-surface w-64 rounded-xl border border-(--border) bg-(--card) text-(--card-foreground) shadow-s backdrop-blur-sm"
          >
            {devSwitchEnabled && (
              <>
                <DropdownMenuLabel>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Cambio rápido (local)
                    </p>
                    <p className="text-[11px] leading-snug text-muted-foreground/80">
                      Selecciona una persona seed para probar distintos roles.
                    </p>
                  </div>
                </DropdownMenuLabel>

                {switchableUsersLoading ? (
                  <DropdownMenuItem disabled>
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    <span className="text-xs">Cargando usuarios…</span>
                  </DropdownMenuItem>
                ) : (switchableUsers?.length ?? 0) > 0 ? (
                  switchableUsers!.map((user) => (
                    <DropdownMenuItem
                      key={user.userId}
                      disabled={
                        user.isCurrent ||
                        (!!switchingUserId && switchingUserId !== user.userId) ||
                        isRefreshing
                      }
                      className="flex flex-col items-start space-y-0.5"
                      onSelect={(event) => {
                        event.preventDefault();
                        void handleSwitchUser(user.userId);
                      }}
                    >
                      <div className="flex w-full items-center justify-between gap-2 text-sm font-medium">
                        <span>
                          {user.fullName}
                          {user.isCurrent ? " (actual)" : ""}
                        </span>
                        {(switchingUserId === user.userId || isRefreshing) && (
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {renderMembershipSummary(user.memberships)}
                      </span>
                      {user.email && (
                        <span className="text-[10px] text-muted-foreground/70">
                          {user.email}
                        </span>
                      )}
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem disabled>
                    No hay usuarios de prueba disponibles.
                  </DropdownMenuItem>
                )}

                {switchError && (
                  <div className="px-3 pb-2 text-xs text-destructive">
                    {switchError}
                  </div>
                )}

                <DropdownMenuSeparator />
              </>
            )}

            {session ? (
              <>
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1.5">
                    <p className="text-sm font-semibold leading-none">
                      {session?.user?.name ?? "Usuario"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session?.user?.email ?? ""}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
              </>
            ) : (
              <DropdownMenuLabel>
                <p className="text-sm font-medium">Mi cuenta</p>
              </DropdownMenuLabel>
            )}

            <DropdownMenuItem asChild>
              <button
                onClick={() => (session ? signOut() : signIn("google"))}
                className="w-full cursor-pointer"
              >
                {session ? (
                  <>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar sesión</span>
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    <span>Iniciar sesión</span>
                  </>
                )}
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

