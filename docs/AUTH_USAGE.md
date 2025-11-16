# Guía de Uso de Autenticación y Roles

Esta guía documenta cómo usar el sistema de autenticación y roles implementado con better-auth.

## 📝 Tabla de Contenidos

1. [Sign In](#sign-in)
2. [Sign Out](#sign-out)
3. [Sistema de Roles](#sistema-de-roles)
4. [Protección de Rutas](#protección-de-rutas)
5. [Protección de UI](#protección-de-ui)

---

## Sign In

### Página de Login

La página de login está en `/login` y usa Google OAuth:

```tsx
// src/app/login/page.tsx
import { authClient } from "~/lib/auth-client";

const handleGoogleSignIn = async () => {
  await authClient.signIn.social({
    provider: "google",
    callbackURL: "/", // Redirige al dashboard después del login
  });
};
```

### Configuración

El auth client está configurado en `src/lib/auth-client.ts`:

```typescript
import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000",
  plugins: [organizationClient()],
});

export const { useSession, signIn, signOut } = authClient;
```

---

## Sign Out

### En un componente

```tsx
import { signOut } from "~/lib/auth-client";
import { useRouter } from "next/navigation";

function LogoutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
        },
      },
    });
  };

  return <button onClick={handleSignOut}>Cerrar sesión</button>;
}
```

---

## Sistema de Roles

### Niveles de Roles

El sistema tiene 3 niveles de roles:

- **SYSTEM**: Roles a nivel de sistema (ej: Superadmin)
- **ORGANIZATION**: Roles a nivel de organización (ej: Administrador, Coordinador, Líder, Colaborador, Invitado)
- **UNIT**: Roles a nivel de unidad

### Roles de Organización

Los roles predefinidos son:

1. **Administrador**: Acceso completo a la organización
2. **Coordinador**: Gestiona equipos, actividades y recursos clave
3. **Líder**: Coordina actividades y seguimiento de participantes
4. **Colaborador**: Apoya tareas específicas y logística
5. **Invitado**: Acceso limitado a información compartida

### Hook `useRole`

```tsx
import { useRole } from "~/app/hooks/useRole";

function MyComponent() {
  const role = useRole();

  // Verificar rol específico
  if (role.hasRole("administrador")) {
    // Mostrar panel de admin
  }

  // Verificar múltiples roles
  if (role.hasAnyRole("administrador", "coordinador")) {
    // Usuario es admin o coordinador
  }

  // Verificar acceso a módulo
  if (role.hasAccessToModule("presupuesto")) {
    // Usuario tiene acceso al módulo de presupuesto
  }

  // Helpers de conveniencia
  if (role.isAdmin()) {
    // Usuario es administrador
  }

  if (role.isCoordinator()) {
    // Usuario es coordinador o superior
  }

  return (
    <div>
      <p>Rol: {role.roleName}</p>
      <p>Organización: {role.organizationName}</p>
    </div>
  );
}
```

---

## Protección de UI

### Componente `RoleGuard`

```tsx
import { RoleGuard } from "~/app/components/auth/RoleGuard";

function AdminPanel() {
  return (
    <RoleGuard allowedRoles={["administrador"]}>
      <div>Este contenido solo lo ven los administradores</div>
    </RoleGuard>
  );
}

// Con múltiples roles
function CoordinatorPanel() {
  return (
    <RoleGuard allowedRoles={["administrador", "coordinador"]}>
      <div>Contenido para admin y coordinadores</div>
    </RoleGuard>
  );
}

// Con verificación de módulos
function BudgetSection() {
  return (
    <RoleGuard requiredModules={["presupuesto"]}>
      <div>Sección de presupuesto</div>
    </RoleGuard>
  );
}

// Con condición personalizada
function CustomCheck() {
  return (
    <RoleGuard
      condition={(role) => role.isAdmin() && role.organizationId === 123}
    >
      <div>Contenido personalizado</div>
    </RoleGuard>
  );
}

// Con fallback personalizado
function WithFallback() {
  return (
    <RoleGuard
      allowedRoles={["administrador"]}
      fallback={<div>No tienes permisos para ver esto</div>}
    >
      <div>Contenido protegido</div>
    </RoleGuard>
  );
}
```

### Hook `useHasPermission`

Para lógica condicional sin renderizar componentes:

```tsx
import { useHasPermission } from "~/app/components/auth/RoleGuard";

function MyComponent() {
  const { canAccess, isAdmin } = useHasPermission();

  const handleAction = () => {
    if (!canAccess({ roles: ["administrador", "coordinador"] })) {
      alert("No tienes permisos para esta acción");
      return;
    }

    // Ejecutar acción
  };

  return (
    <div>
      {canAccess({ modules: ["configuracion"] }) && (
        <button onClick={handleAction}>Configurar</button>
      )}
    </div>
  );
}
```

---

## Protección de Rutas

### En tRPC (Server-side)

Ya tienes procedures configurados:

```typescript
// Requiere autenticación
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user?.id) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

// Requiere organización activa
export const orgProtectedProcedure = protectedProcedure.use(
  async ({ ctx, next, input }) => {
    // Verifica organización
    return next({ ctx });
  }
);

// Solo administradores
export const adminProcedure = protectedProcedure.use(
  async ({ ctx, next }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.user.id },
      include: { system_role: true },
    });

    if (user?.system_role?.name !== "Superadmin") {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    return next({ ctx });
  }
);
```

### Uso en routers

```typescript
export const myRouter = createTRPCRouter({
  // Endpoint público
  publicData: publicProcedure.query(() => {
    return { message: "Público" };
  }),

  // Requiere autenticación
  protectedData: protectedProcedure.query(({ ctx }) => {
    return { userId: ctx.user.id };
  }),

  // Requiere organización
  orgData: orgProtectedProcedure.query(({ ctx }) => {
    return { org: ctx.user.activeOrganizationId };
  }),

  // Solo admin
  adminData: adminProcedure.query(() => {
    return { secret: "Admin only" };
  }),
});
```

---

## Modo Desarrollo

En desarrollo (`NODE_ENV=development`):

- ✅ Middleware deshabilitado - no redirige a login
- ✅ Se crea usuario `dev@localhost` automáticamente
- ✅ Todos los procedures permiten acceso
- ✅ No se requiere Google OAuth

Esto te permite desarrollar sin preocuparte por auth.

---

## Migración a Producción

Cuando estés listo para producción:

1. Cambiar `NODE_ENV` a `production`
2. Agregar lógica de autorización en `auth/config.ts`:

```typescript
export const authConfig = {
  // ...
  callbacks: {
    async signIn({ profile }) {
      // Agregar verificación de emails permitidos
      const allowedEmails = process.env.ALLOWED_EMAILS?.split(",") ?? [];
      if (!allowedEmails.includes(profile.email)) {
        return false;
      }
      return true;
    },
  },
};
```

3. Configurar middleware en `src/middleware.ts`
4. Verificar que todos los endpoints usen el procedure correcto

---

## Ejemplos Completos

### Dashboard con Roles

```tsx
import { useRole } from "~/app/hooks/useRole";
import { RoleGuard } from "~/app/components/auth/RoleGuard";

export function Dashboard() {
  const role = useRole();

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Bienvenido, {role.organizationName}</p>
      <p>Tu rol: {role.roleName}</p>

      {/* Sección solo para admins */}
      <RoleGuard allowedRoles={["administrador"]}>
        <AdminPanel />
      </RoleGuard>

      {/* Sección para coordinadores y superiores */}
      <RoleGuard allowedRoles={["administrador", "coordinador"]}>
        <CoordinatorPanel />
      </RoleGuard>

      {/* Sección para todos con acceso al módulo */}
      <RoleGuard requiredModules={["campamentos"]}>
        <CampsSection />
      </RoleGuard>
    </div>
  );
}
```

---

## Troubleshooting

### Error: "Usuario no tiene una persona asociada"

✅ **Solucionado**: Ahora se crea automáticamente una `Person` cuando no existe.

### Sesión no persiste después de login

Verificar que:

1. Las cookies estén habilitadas
2. El `baseURL` en `auth-client.ts` sea correcto
3. El route handler esté en `/api/auth/[...betterauth]/route.ts`

### No puedo hacer login en desarrollo

En desarrollo, no necesitas login. El sistema crea automáticamente un usuario `dev@localhost`.

Si quieres probar el flujo completo de Google OAuth:

1. Configurar variables de entorno:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
2. Ir a `/login`
3. Click en "Continuar con Google"
