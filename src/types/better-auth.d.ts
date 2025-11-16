declare module "better-auth" {
  export type Session = {
    user?: {
      id: string;
      name?: string | null;
      email?: string | null;
      person_id?: number | null;
      activeOrganizationId?: string | null; // Campo del plugin
    };
  } | null;
}

declare module "better-auth/react" {
  import type { Session } from "better-auth";
  import type { ReactNode } from "react";

  export function useSession(options?: {
    refetchInterval?: number;
    refetchOnWindowFocus?: boolean;
  }): { data: Session; isPending: boolean; status: "loading" | "authenticated" | "unauthenticated" };

  export function signIn(providerId?: string, options?: any): Promise<void | { error?: string }>;
  export function signOut(options?: any): Promise<void>;
  
  // ESTA ES LA DEFINICIÓN CORREGIDA Y COMPLETA
  export function createAuthClient(options: {
    baseURL: string;
    plugins?: any[]; // <-- Acepta plugins
  }): {
    useSession: (options?: {
      refetchInterval?: number;
      refetchOnWindowFocus?: boolean;
    }) => { data: Session; isPending: boolean; status: "loading" | "authenticated" | "unauthenticated" };
    signIn: any;
    signOut: any;
    getSession: () => Promise<Session | null>;
    organization: any; // <-- Expone los métodos del plugin
  };
}