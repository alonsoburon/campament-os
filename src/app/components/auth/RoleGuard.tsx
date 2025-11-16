"use client";

import { useRole } from "~/app/hooks/useRole";
import { Alert, AlertDescription, AlertTitle } from "~/app/components/ui/alert";
import { ShieldAlert } from "lucide-react";

type RoleGuardProps = {
  /** Roles permitidos para ver el contenido */
  allowedRoles?: string[];
  /** Módulos requeridos para ver el contenido */
  requiredModules?: string[];
  /** Verificación personalizada */
  condition?: (role: ReturnType<typeof useRole>) => boolean;
  /** Contenido a mostrar si el usuario tiene permisos */
  children: React.ReactNode;
  /** Mensaje personalizado cuando no tiene permisos */
  fallback?: React.ReactNode;
  /** Mostrar un mensaje de error por defecto */
  showError?: boolean;
};

/**
 * Componente para proteger secciones de UI basadas en roles
 * Siguiendo las mejores prácticas de better-auth
 *
 * @example
 * ```tsx
 * <RoleGuard allowedRoles={["administrador", "coordinador"]}>
 *   <AdminPanel />
 * </RoleGuard>
 * ```
 */
export function RoleGuard({
  allowedRoles,
  requiredModules,
  condition,
  children,
  fallback,
  showError = true,
}: RoleGuardProps) {
  const role = useRole();

  // Mostrar loading
  if (role.isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-sm text-muted-foreground">Verificando permisos...</div>
      </div>
    );
  }

  // Verificar condición personalizada
  if (condition && !condition(role)) {
    return fallback ?? (showError ? <AccessDenied /> : null);
  }

  // Verificar roles permitidos
  if (allowedRoles && !role.hasAnyRole(...allowedRoles)) {
    return fallback ?? (showError ? <AccessDenied /> : null);
  }

  // Verificar módulos requeridos
  if (requiredModules) {
    const hasAllModules = requiredModules.every((module) =>
      role.hasAccessToModule(module)
    );
    if (!hasAllModules) {
      return fallback ?? (showError ? <AccessDenied /> : null);
    }
  }

  // Renderizar contenido
  return <>{children}</>;
}

/**
 * Componente de acceso denegado por defecto
 */
function AccessDenied() {
  return (
    <Alert variant="destructive" className="max-w-md">
      <ShieldAlert className="h-4 w-4" />
      <AlertTitle>Acceso denegado</AlertTitle>
      <AlertDescription>
        No tienes permisos suficientes para ver este contenido. Contacta con un
        administrador si crees que esto es un error.
      </AlertDescription>
    </Alert>
  );
}

/**
 * Hook para verificar permisos de forma imperativa
 * Útil para lógica condicional en lugar de renderizado
 */
export function useHasPermission() {
  const role = useRole();

  return {
    canAccess: (options: {
      roles?: string[];
      modules?: string[];
      condition?: (role: ReturnType<typeof useRole>) => boolean;
    }): boolean => {
      if (options.condition && !options.condition(role)) {
        return false;
      }

      if (options.roles && !role.hasAnyRole(...options.roles)) {
        return false;
      }

      if (options.modules) {
        const hasAllModules = options.modules.every((module) =>
          role.hasAccessToModule(module)
        );
        if (!hasAllModules) {
          return false;
        }
      }

      return true;
    },
    ...role,
  };
}
