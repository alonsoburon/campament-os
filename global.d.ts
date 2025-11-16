declare module "@better-auth/next" {
  export type Session = {
    user?: {
      id: string;
      name?: string | null;
      email?: string | null;
      person_id?: number;
      organization_id?: number;
      organization_name?: string | null;
      role_name?: string | null;
    };
  } | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export function BetterAuth(options: any): {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handlers: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    auth: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    signIn: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    signOut: any;
  };
}

declare module "@better-auth/next/react" {
  import type { Session } from "@better-auth/next";
  import type { ReactNode } from "react";
  export function useSession(options?: {
    refetchInterval?: number;
    refetchOnWindowFocus?: boolean;
  }): { data: Session; status: "loading" | "authenticated" | "unauthenticated" };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export function signIn(providerId?: string, options?: any): Promise<void | { error?: string }>;
  export function signOut(): Promise<void>;
  export function SessionProvider(props: { children: ReactNode }): ReactNode;
}

declare module "@better-auth/prisma-adapter" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export function PrismaAdapter(client: any): any;
}

declare module "@better-auth/google-provider" {
  export default function Google(config: { clientId: string; clientSecret: string }): unknown;
}

declare module "@better-auth/credentials-provider" {
  export default function Credentials(config: {
    id: string;
    name: string;
    credentials: Record<string, { label: string; type: string }>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    authorize: (credentials?: any) => Promise<unknown>;
  }): unknown;
}

declare module "better-auth/next-js" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export function toNextJsHandler(auth: any): { GET: any; POST: any };
}


