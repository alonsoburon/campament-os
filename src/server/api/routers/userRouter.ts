import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const userRouter = createTRPCRouter({
  sendInvitation: protectedProcedure
    .input(
      z.object({
        email: z.string().email(),
        organizationId: z.number(),
        roleId: z.number(), // El rol que se le asignará en la organización
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verificar que el usuario que envía la invitación sea administrador de la organización
      const inviterMembership = await ctx.db.organizationMember.findUnique({
        where: {
          person_id_organization_id: {
            person_id: ctx.session.user.person_id,
            organization_id: input.organizationId,
          },
        },
        include: { role: true },
      });

      if (!inviterMembership || inviterMembership.role.name !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Solo los administradores de la organización pueden enviar invitaciones.",
        });
      }

      // Generar un token de invitación único
      const invitationToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

      // Crear o actualizar el usuario con el token de invitación
      const user = await ctx.db.user.upsert({
        where: { email: input.email },
        update: {
          invitation_token: invitationToken,
          invitation_status: "PENDING",
          invitation_sent_at: new Date(),
          // Almacenar temporalmente el ID de la organización y el rol para cuando el usuario acepte
          pending_group_id: input.organizationId, // Renombrado de pending_organization_id para coincidir con schema.prisma
          pending_system_role_id: input.roleId, // Renombrado de pending_role_id para coincidir con schema.prisma
        },
        create: {
          email: input.email,
          invitation_token: invitationToken,
          invitation_status: "PENDING",
          invitation_sent_at: new Date(),
          // Asignar un rol de sistema por defecto temporalmente, se actualizará al aceptar
          system_role_id: 1, // Suponiendo que el ID 1 es un rol de sistema por defecto (ej. 'Miembro Pendiente')
          person_id: 1, // Valor temporal, se asignará una persona real al aceptar
          // Almacenar temporalmente el ID de la organización y el rol para cuando el usuario acepte
          pending_group_id: input.organizationId, // Renombrado de pending_organization_id para coincidir con schema.prisma
          pending_system_role_id: input.roleId, // Renombrado de pending_role_id para coincidir con schema.prisma
        },
      });

      // TODO: Aquí se debería enviar un correo electrónico con el invitationToken al input.email
      console.log(`Invitación enviada a ${input.email} con token: ${invitationToken}`);

      return { message: "Invitación enviada con éxito.", invitationToken };
    }),

  acceptInvitation: publicProcedure // Debe ser público para que los usuarios no registrados puedan aceptarla
    .input(
      z.object({
        invitationToken: z.string(),
        fullName: z.string(),
        phone: z.string().optional(),
        emergencyContact: z.string().optional(),
        birthDate: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Buscar al usuario por el token de invitación
      const user = await ctx.db.user.findUnique({
        where: { invitation_token: input.invitationToken },
        include: { pending_system_role: true },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Token de invitación inválido o ya utilizado.",
        });
      }

      if (user.invitation_status !== "PENDING") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Esta invitación ya ha sido aceptada o no está pendiente.",
        });
      }

      // Crear o vincular una Persona si no existe
      let person;
      if (!user.person_id) { // Si no hay person_id asignado, crear una nueva persona
        person = await ctx.db.person.create({
          data: {
            full_name: input.fullName,
            phone: input.phone,
            emergency_contact: input.emergencyContact,
            birth_date: input.birthDate,
            created_at: new Date(),
            updated_at: new Date(),
            creator_id: user.person_id, 
            updater_id: user.person_id, 
          },
        });

        // Actualizar el user.person_id con el ID de la persona recién creada
        await ctx.db.user.update({
          where: { id: user.id },
          data: {
            person_id: person.id,
          },
        });
        user.person_id = person.id; // Actualizar el objeto user en memoria
      } else {
        person = await ctx.db.person.findUnique({ where: { id: user.person_id } });
        if (!person) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "La persona asociada a este usuario no se encontró.",
          });
        }
        // Actualizar el nombre de la persona si se proporciona uno nuevo al aceptar la invitación
        await ctx.db.person.update({
          where: { id: person.id },
          data: {
            full_name: input.fullName || person.full_name,
          },
        });
      }

      // Asignar el rol en la organización
      if (user.pending_group_id && user.pending_system_role_id) {
        await ctx.db.organizationMember.create({
          data: {
            person_id: user.person_id,
            organization_id: user.pending_group_id,
            role_id: user.pending_system_role_id,
            assigned_at: new Date(),
          },
        });
      }

      // Actualizar el estado de la invitación y limpiar el token
      const updatedUser = await ctx.db.user.update({
        where: { id: user.id },
        data: {
          invitation_status: "ACCEPTED",
          invitation_token: null,
          // Limpiar los campos pendientes después de la aceptación
          pending_group_id: null,
          pending_system_role_id: null,
          // Asignar el rol del sistema según el rol en la organización, o un rol de usuario estándar si no se especificó uno
          system_role_id: user.pending_system_role_id || 2, // Suponiendo que el ID 2 es un rol de sistema de 'Usuario Estándar'
        },
      });

      return { message: "Invitación aceptada con éxito.", user: updatedUser };
    }),

  getInvitationStatus: publicProcedure // Puede ser público para permitir que los usuarios verifiquen un token antes de iniciar sesión
    .input(z.object({ invitationToken: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { invitation_token: input.invitationToken },
        select: { invitation_status: true, email: true, pending_group_id: true, pending_system_role: { select: { name: true } } },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Token de invitación inválido.",
        });
      }

      return { status: user.invitation_status, email: user.email, organizationId: user.pending_group_id, roleName: user.pending_system_role?.name };
    }),

  getUserRoles: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userRoles = await ctx.db.organizationMember.findMany({
        where: {
          person: { user: { id: input.userId } },
        },
        include: {
          organization: true,
          role: true,
        },
      });
      return userRoles;
    }),

  listSwitchableUsers: protectedProcedure.query(async ({ ctx }) => {
    if (process.env.NODE_ENV === "production") {
      return [];
    }

    const users = await ctx.db.user.findMany({
      orderBy: { name: "asc" },
      include: {
        person: {
          select: {
            id: true,
            full_name: true,
            organizations: {
              include: {
                organization: {
                  select: { id: true, name: true },
                },
                role: {
                  select: { id: true, name: true },
                },
              },
              orderBy: { assigned_at: "asc" },
            },
          },
        },
      },
    });

    return users
      .filter((user) => user.person !== null)
      .map((user) => ({
        userId: user.id,
        fullName:
          user.person?.full_name ??
          user.name ??
          user.email ??
          "Usuario sin nombre",
        email: user.email,
        personId: user.person!.id,
        isCurrent: user.id === ctx.session.user.id,
        memberships: user.person!.organizations.map((membership) => ({
          organizationId: membership.organization_id,
          organizationName: membership.organization.name,
          roleId: membership.role_id,
          roleName: membership.role.name,
        })),
      }));
  }),
});
