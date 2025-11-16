import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

const ALL_MODULES = [
  "inicio",
  "campamentos",
  "personas",
  "inventario",
  "alimentacion",
  "transporte",
  "alojamiento",
  "actividades",
  "salud",
  "tareas",
  "presupuesto",
  "reportes",
  "configuracion",
] as const;

const ROLE_MODULES: Record<string, (typeof ALL_MODULES)[number][]> = {
  administrador: [...ALL_MODULES],
  superadmin: [...ALL_MODULES],
  coordinador: [
    "inicio",
    "campamentos",
    "personas",
    "inventario",
    "alimentacion",
    "transporte",
    "alojamiento",
    "actividades",
    "salud",
    "tareas",
    "presupuesto",
    "reportes",
  ],
  lider: [
    "inicio",
    "campamentos",
    "personas",
    "actividades",
    "tareas",
    "salud",
    "reportes",
  ],
  colaborador: [
    "inicio",
    "campamentos",
    "tareas",
    "transporte",
    "alojamiento",
    "salud",
  ],
  invitado: ["inicio", "reportes"],
};

function normalizeRoleName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export const organizationRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        type_id: z.number(),
        number: z.number().optional(),
        district: z.string().optional(),
        zone: z.string().optional(),
        address: z.string().optional(),
        phone: z.string().optional(),
        group_email: z.string().email().optional(),
        is_mixed: z.boolean().optional(),
        foundation_date: z.date().optional(),
        primary_color: z.number().optional(),
        secondary_color: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user.person_id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "El usuario no tiene una persona asociada.",
        });
      }
      const personId = ctx.user.person_id;

      const defaultRoleDefinitions = [
        {
          name: "Administrador",
          scope: "ORGANIZATION",
          description: "Acceso completo para configurar la organización.",
        },
        {
          name: "Coordinador",
          scope: "ORGANIZATION",
          description: "Gestiona equipos, actividades y recursos clave.",
        },
        {
          name: "Líder",
          scope: "ORGANIZATION",
          description: "Coordina actividades y seguimiento de participantes.",
        },
        {
          name: "Colaborador",
          scope: "ORGANIZATION",
          description: "Apoya tareas específicas y logística.",
        },
        {
          name: "Invitado",
          scope: "ORGANIZATION",
          description: "Acceso limitado a información compartida.",
        },
      ] as const;

      const [adminRoleDefinition, ...otherRoleDefinitions] =
        defaultRoleDefinitions;

      const defaultBranches = [
        "Manada / Lobatos",
        "Tropa Scout",
        "Caminantes / Raiders",
        "Clan Rover",
        "Kraal / Dirección",
      ];

      const { organization } = await ctx.db.$transaction(async (tx) => {
        const createdOrganization = await tx.organization.create({
          data: {
            name: input.name,
            type_id: input.type_id,
            number: input.number,
            district: input.district,
            zone: input.zone,
            address: input.address,
            phone: input.phone,
            group_email: input.group_email,
            is_mixed: input.is_mixed,
            foundation_date: input.foundation_date,
            primary_color: input.primary_color,
            secondary_color: input.secondary_color,
            creator_id: personId,
            updater_id: personId,
          },
        });

        const adminRole = await tx.role.create({
          data: {
            name: adminRoleDefinition.name,
            scope: adminRoleDefinition.scope,
            description: adminRoleDefinition.description,
            organization_id: createdOrganization.id,
          },
        });

        if (otherRoleDefinitions.length > 0) {
          await tx.role.createMany({
            data: otherRoleDefinitions.map((role) => ({
              name: role.name,
              scope: role.scope,
              description: role.description,
              organization_id: createdOrganization.id,
            })),
          });
        }

        if (defaultBranches.length > 0) {
          await tx.branch.createMany({
            data: defaultBranches.map((branchName) => ({
              name: branchName,
              organization_id: createdOrganization.id,
            })),
          });
        }

        await tx.organizationMember.create({
          data: {
            person_id: personId,
            organization_id: createdOrganization.id,
            role_id: adminRole.id,
          },
        });

        return { organization: createdOrganization };
      });

      return organization;
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      // Lógica para obtener una organización por ID
      const organization = await ctx.db.organization.findUnique({
        where: {
          id: input.id,
        },
      });
      return organization;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        type_id: z.number().optional(),
        number: z.number().optional(),
        district: z.string().optional(),
        zone: z.string().optional(),
        address: z.string().optional(),
        phone: z.string().optional(),
        group_email: z.string().email().optional(),
        is_mixed: z.boolean().optional(),
        foundation_date: z.date().optional(),
        primary_color: z.number().optional(),
        secondary_color: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Lógica para actualizar una organización
      const organization = await ctx.db.organization.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          type_id: input.type_id,
          number: input.number,
          district: input.district,
          zone: input.zone,
          address: input.address,
          phone: input.phone,
          group_email: input.group_email,
          is_mixed: input.is_mixed,
          foundation_date: input.foundation_date,
          primary_color: input.primary_color,
          secondary_color: input.secondary_color,
          updater_id: ctx.user.person_id ?? undefined, // Actualizar el actualizador
        },
      });
      return organization;
    }),

  listTypes: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.organizationType.findMany({
      orderBy: { name: "asc" },
    });
  }),

  getCurrentContext: protectedProcedure.query(async ({ ctx }) => {
    const personId = ctx.user.person_id;
    const organizationId = ctx.user.organization_id;
    const organizationName = ctx.user.organization_name;
    const roleName = ctx.user.role_name;

    if (!personId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "El usuario no tiene una persona asociada.",
      });
    }

    if (!organizationId) {
      return {
        organization: null,
        role: null,
        allowedModules: ["inicio"] as (typeof ALL_MODULES)[number][],
      };
    }

    // OPTIMIZACIÓN: Si la sesión ya tiene toda la info, NO hacer query a la BD
    if (organizationName && roleName) {
      const roleNameNormalized = normalizeRoleName(roleName);
      const allowedModules =
        ROLE_MODULES[roleNameNormalized] ?? (["inicio"] as (typeof ALL_MODULES)[number][]);

      return {
        organization: {
          id: organizationId,
          name: organizationName,
        },
        role: {
          id: 0, // No tenemos el role_id en la sesión, pero no es crítico
          name: roleName,
        },
        allowedModules,
      };
    }

    // Fallback: Si no está en la sesión, hacer la query (solo en casos raros)
    const membership = await ctx.db.organizationMember.findUnique({
      where: {
        person_id_organization_id: {
          person_id: personId,
          organization_id: organizationId,
        },
      },
      include: {
        role: true,
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!membership) {
      return {
        organization: null,
        role: null,
        allowedModules: ["inicio"] as (typeof ALL_MODULES)[number][],
      };
    }

    const roleNameNormalized = normalizeRoleName(membership.role.name);
    const allowedModules =
      ROLE_MODULES[roleNameNormalized] ?? (["inicio"] as (typeof ALL_MODULES)[number][]);

    return {
      organization: membership.organization,
      role: {
        id: membership.role_id,
        name: membership.role.name,
      },
      allowedModules,
    };
  }),
});
