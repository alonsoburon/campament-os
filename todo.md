# Roadmap de Desarrollo: De Prototipo a SaaS para CampamentOS 🚀

Este documento traza el camino para transformar el prototipo de CampamentOS en un Software as a Service (SaaS) robusto y multi-tenant. La base actual es excelente, con una interfaz de usuario bien definida y un esquema de base de datos flexible. Ahora, nos enfocaremos en construir la lógica de negocio y las características SaaS.

## Fase 0: Fundamentos y Habilitación SaaS (Trabajo Crítico)  foundational

_Objetivo: Eliminar los cuellos de botella del prototipo, establecer la arquitectura de la API y asegurar la multi-tenencia desde el núcleo._

-   **[x] 1. API tRPC - Módulos Base:**
    -   [x] Crear el router `organizationRouter.ts` con procedimientos para `create`, `getById`, `update`.
    -   [x] Crear el router `personRouter.ts` para CRUD de personas dentro de una organización.
    -   [x] Crear el router `userRouter.ts` para gestionar invitaciones y roles.
    -   [x] Registrar los nuevos routers en `src/server/api/root.ts`.

-   **[ ] 2. Autenticación y Autorización Multi-Tenant:**
    -   [x] **Eliminar el cuello de botella de `AUTHORIZED_EMAIL`** (Diferido por solicitud del usuario): Modificar `src/server/auth/config.ts` para permitir el registro de nuevos usuarios.
    -   [x] **Implementar Flujo de Invitaciones**:
        -   [x] Crear un procedimiento en `userRouter` para que un admin de organización pueda generar un `invitation_token`.
        -   [x] Crear una página de registro donde los usuarios puedan usar su token para unirse a una organización específica.
        -   [x] Al aceptar, asignar `person_id` y el rol correspondiente al `User`.
    -   [x] **Crear Procedimiento Protegido por Organización**: Extender el `protectedProcedure` de tRPC para crear un `organizationProcedure` que valide que el usuario que hace la llamada pertenece a la organización que intenta modificar (`ctx.session.user.organizationId === input.organizationId`).
    -   [ ] Habilitar en entorno local el cambio rápido entre usuarios/personas para probar roles distintos.

-   **[x] 3. Flujo de Onboarding Inicial:**
    -   [x] Crear una página "Crear mi Organización" para el primer usuario que se registra.
    -   [x] Implementar el `create` en `organizationRouter` para que al crear una `Organization`, también se cree el `OrganizationMember` que vincula al creador como administrador.
    -   [x] Al crear una organización, generar los `Roles` y `Branches` por defecto para esa organización.

-   **[x] 4. Dinamizar la Interfaz de Usuario:**
    -   [x] Conectar el `Sidebar` para que los módulos se muestren según los permisos del rol del usuario.
    -   [x] Conectar el `PageHeader` para mostrar correctamente la información del usuario logueado desde la sesión.
    -   [x] Reemplazar los datos estáticos del `Dashboard` con llamadas a la API de tRPC (ej. `campRouter.getUpcoming`, `taskRouter.getCritical`).

## Fase 1: Implementación del MVP - Módulos Centrales 🏕️

_Objetivo: Construir la funcionalidad principal de gestión de campamentos, asegurando que cada módulo respete la lógica multi-tenant._

-   **[ ] Módulo de Campamentos:**
    -   [ ] Implementar tRPC router `campRouter.ts` con CRUD completo.
    -   [ ] Diseñar la vista de lista de campamentos (`/campamentos`) con filtros.
    -   [ ] Crear la vista de detalle de un campamento con un layout de pestañas (`/campamentos/[id]`).
    -   [ ] Implementar la pestaña "Participantes":
        -   [ ] UI para buscar y añadir `Person` a un `Camp` (creando un `CampParticipation`).
        -   [ ] Mostrar la lista de participantes con su estado de pago.

-   **[ ] Módulo de Personas:**
    -   [ ] Vista de tabla para listar todas las `Person` de una organización.
    -   [ ] Formulario para crear/editar `Person`.
    -   [ ] En el perfil de una persona, UI para gestionar sus roles (`OrganizationMember`).

-   **[ ] Módulo de Salud:**
    -   [ ] En el perfil de una `Person`, añadir formularios para `Allergy` y `MedicalInfo`.
    -   [ ] En la vista de participantes de un `Camp`, mostrar insignias/alertas para personas con información médica relevante.
    -   [ ] Crear un tRPC endpoint para obtener un "Reporte de Salud" de un campamento.

-   **[ ] Módulo de Alimentación:**
    -   [ ] CRUD para `Ingredient` y `Dish` (recursos de la `Organization`).
    -   [ ] UI para el `CampMenu`: un calendario/agenda para asignar `Dish` a días y comidas específicas de un `Camp`.
    -   [ ] Mostrar alérgenos presentes en el menú del día.

-   **[ ] Módulo de Logística (Simplificado):**
    -   [ ] CRUD básico para `Transport` y `Accommodation` asociados a un `Camp`.
    -   [ ] CRUD básico para `Utensil` asociado a una `Organization`.
    -   [ ] UI para asignar participantes a un transporte o alojamiento específico.

-   **[ ] Módulo de Tareas:**
    -   [ ] CRUD para `Task` asociado a un `Camp`.
    -   [ ] Vista de tablero Kanban (usando `dnd-kit` o similar) para gestionar el estado de las tareas.
    -   [ ] UI para asignar `Person` a una `Task`.

## Fase 2: Características Avanzadas y Experiencia de Usuario ✨

_Objetivo: Añadir profundidad al producto, mejorar flujos y ofrecer más valor a los usuarios avanzados._

-   **[ ] Módulo de Presupuesto:**mpecemos
    -   [ ] UI para crear un `Budget` para un `Camp`.
    -   [ ] Formularios para añadir `BudgetItem` y vincularlos a `Ingredient`, `Transport`, etc.
    -   [ ] Vista que compare costos estimados vs. reales.

-   **[ ] Módulo de Reportes:**
    -   [ ] Crear un dashboard de reportes con gráficos (usando `recharts`).
    -   [ ] Reporte financiero por campamento.
    -   [ ] Reporte de asistencia y demografía.
    -   [ ] Reporte de inventario.

-   **[ ] Notificaciones:**
    -   [ ] Implementar un sistema de notificaciones en la app (ej. usando Sonner para toasts).
    -   [ ] Notificar sobre tareas que vencen pronto, pagos pendientes, etc.

-   **[ ] Subida de Archivos:**
    -   [ ] Integrar un servicio de almacenamiento (ej. AWS S3, Cloudflare R2).
    -   [ ] Permitir subir documentos a `Person` (ej. permisos) o `Camp` (ej. planes).

-   **[ ] Búsqueda Global:**
    -   [ ] Implementar una barra de búsqueda global (usando `cmdk`) para encontrar rápidamente personas, campamentos, ingredientes, etc.

## Fase 3: Monetización y Crecimiento (El SaaS Real) 💰

_Objetivo: Transformar la aplicación en un negocio sostenible con facturación, planes y un onboarding pulido._

-   **[ ] Integración de Pagos y Suscripciones:**
    -   [ ] Elegir un proveedor de pagos (Stripe, Lemon Squeezy).
    -   [ ] Añadir modelos a `schema.prisma`: `Subscription`, `Plan`, `Invoice`.
    -   [ ] Crear webhooks para gestionar el estado de las suscripciones.
    -   [ ] Crear una página de precios y un flujo de checkout.
    -   [ ] Crear un portal de cliente para que gestionen su suscripción.

-   **[ ] Límites de Planes y Medición de Uso (Metering):**
    -   [ ] Definir límites para diferentes planes (ej. número de miembros, campamentos, almacenamiento).
    -   [ ] Implementar middleware en la API para verificar los límites del plan antes de ejecutar una mutación.

-   **[ ] Panel de Superadministrador:**
    -   [ ] Crear un área separada para que los administradores de CampamentOS gestionen usuarios, organizaciones y suscripciones.
    -   [ ] Implementar un rol de `SUPERADMIN` en el modelo `Role`.

-   **[ ] Onboarding Guiado:**
    -   [ ] Crear un checklist o un tour guiado para nuevos administradores de organizaciones, ayudándolos a configurar su primer campamento.

## Fase 4: Despliegue y Operaciones 🌐

_Objetivo: Lanzar el producto y asegurar su estabilidad, rendimiento y mantenibilidad._

-   **[ ] Infraestructura de Producción:**
    -   [ ] Configurar un proveedor de base de datos de producción (ej. Vercel Postgres, Supabase, Neon).
    -   [ ] Configurar el hosting (Vercel es el candidato natural).
    -   [ ] Configurar variables de entorno de producción y `AUTH_SECRET`.

-   **[ ] CI/CD (Integración y Despliegue Continuo):**
    -   [ ] Configurar GitHub Actions para ejecutar `lint` y `typecheck` en cada push.
    -   [ ] Configurar despliegues automáticos a producción al hacer merge a `main`.

-   **[ ] Monitorización y Logs:**
    -   [ ] Integrar un servicio de monitorización de errores (ej. Sentry).
    -   [ ] Integrar un servicio de logging (ej. Logtail, Axiom).

-   **[ ] Script de Seeding:**
    -   [ ] Crear un script en `prisma/seed.ts` para poblar la base de datos con datos esenciales, como los roles de sistema (`SYSTEM`).