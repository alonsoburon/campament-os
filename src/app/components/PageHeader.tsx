"use client";

import type { Session } from "next-auth";

import { ThemeToggle } from "./ThemeToggle";

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
  const action = session ? signOutAction : signInAction;
  const actionLabel = session ? "Cerrar sesión" : "Iniciar sesión";

  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-4 px-8 py-6">
      <div className="flex items-center gap-3">
        {badgeLabel ? (
          <span className="rounded-full bg-(--surface-active) px-3 py-1 text-xs uppercase tracking-widest text-(--text-secondary)">
            {badgeLabel}
          </span>
        ) : null}
        <ThemeToggle />
        <form action={action}>
          <button className="rounded-full bg-(--surface-active) px-4 py-2 text-sm transition-colors hover:bg-(--primary) hover:text-(--primary-foreground)">
            {actionLabel}
          </button>
        </form>
      </div>
    </div>
  );
}

