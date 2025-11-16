"use client";

import { useEffect } from "react";
import { authClient } from "~/lib/auth-client";

export default function LoginPage() {
  useEffect(() => {
    void authClient.signIn.social({ provider: "google" });
  }, []);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-sm text-muted-foreground">Redirigiendo a Google…</div>
    </div>
  );
}


