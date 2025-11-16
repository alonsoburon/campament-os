"use client";

import { useSession } from "~/lib/auth-client";
import { api } from "~/trpc/react";

/**
 * Hook para verificar roles y permisos del usuario
 * Siguiendo las mejores prácticas de better-auth para manejo de roles
 */
export function useRole() {
  const { data: session, isPending: sessionLoading } = useSession();
  const {
    data: context,
    isLoading: contextLoading,
    error: contextError,
  } = api.organization.getCurrentContext.useQuery(undefined, {
    enabled: !!session?.user,
    staleTime: 60_000,
  });

  const isLoading = sessionLoading || contextLoading;

  /**
   * Verificar si el usuario tiene un rol específico en su organización activa
   */
  const hasRole = (roleName: string): boolean => {
    if (!context?.role?.name) return false;
    return context.role.name.toLowerCase() === roleName.toLowerCase();
  };

  /**
   * Verificar si el usuario tiene alguno de los roles especificados
   */
  const hasAnyRole = (...roleNames: string[]): boolean => {
    if (!context?.role?.name) return false;
    const userRole = context.role.name.toLowerCase();
    return roleNames.some((role) => userRole === role.toLowerCase());
  };

  /**
   * Verificar si el usuario tiene acceso a un módulo
   */
  const hasAccessToModule = (moduleId: string): boolean => {
    if (!context?.allowedModules) return false;
    return context.allowedModules.includes(moduleId as any);
  };

  /**
   * Verificar si el usuario es admin (Administrador o Superadmin)
   */
  const isAdmin = (): boolean => {
    return hasAnyRole("administrador", "superadmin");
  };

  /**
   * Verificar si el usuario es coordinador o superior
   */
  const isCoordinator = (): boolean => {
    return hasAnyRole("coordinador", "administrador", "superadmin");
  };

  return {
    // Estado
    isLoading,
    error: contextError,

    // Datos del rol
    roleName: context?.role?.name,
    roleId: context?.role?.id,
    organizationId: context?.organization?.id,
    organizationName: context?.organization?.name,
    allowedModules: context?.allowedModules ?? [],

    // Métodos de verificación
    hasRole,
    hasAnyRole,
    hasAccessToModule,
    isAdmin,
    isCoordinator,
  };
}
