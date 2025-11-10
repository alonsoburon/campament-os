"use client";

import type { Session } from "next-auth";
import { User, LogOut, LogIn } from "lucide-react";

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

type PageHeaderProps = {
  title: string;
  description?: string;
  badgeLabel?: string;
  session: Session | null;
  signInAction: () => Promise<void>;
  signOutAction: () => Promise<void>;
};

export function PageHeader({
  title,
  description,
  badgeLabel,
  session,
  signInAction,
  signOutAction,
}: PageHeaderProps) {
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
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-neutral-900 to-neutral-700 text-xs font-semibold text-white dark:from-neutral-100 dark:to-neutral-300 dark:text-neutral-900">
                {session?.user?.name?.[0]?.toUpperCase() ?? "U"}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="profile-menu-surface w-64 rounded-xl border border-(--border) bg-(--card) text-(--card-foreground) shadow-s backdrop-blur-sm"
          >
            {session ? (
              <>
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1.5">
                    <p className="text-sm font-semibold leading-none">
                      {session.user.name ?? "Usuario"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session.user.email}
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

            <form action={session ? signOutAction : signInAction}>
              <DropdownMenuItem asChild>
                <button type="submit" className="w-full cursor-pointer">
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
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

