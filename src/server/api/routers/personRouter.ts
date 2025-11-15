import { z } from "zod";
import { createTRPCRouter, protectedProcedure, organizationProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const personRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        fullName: z.string(),
        organizationId: z.number(),
        phone: z.string().optional(),
        emergencyContact: z.string().optional(),
        birthDate: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Lógica para crear una persona
      const person = await ctx.db.person.create({
        data: {
          full_name: input.fullName,
          phone: input.phone,
          emergency_contact: input.emergencyContact,
          birth_date: input.birthDate,
          // Asegúrate de que el usuario logueado sea el creador
          creator_id: ctx.session.user.person_id,
          updater_id: ctx.session.user.person_id,
          // Aquí se deberían añadir las relaciones con la organización si son necesarias al crear la persona
          // Por ejemplo, si se crea directamente como miembro de una organización:
          organizations: {
            create: {
              organization_id: input.organizationId,
              role_id: 1, // Asignar un rol por defecto (ej. Miembro). Esto debe ser dinámico más adelante.
            },
          },
        },
      });
      return person;
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      // Lógica para obtener una persona por ID
      const person = await ctx.db.person.findUnique({
        where: {
          id: input.id,
        },
        include: { organizations: true }, // Incluir organizaciones si es necesario
      });
      return person;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        fullName: z.string().optional(),
        phone: z.string().optional(),
        emergencyContact: z.string().optional(),
        birthDate: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Lógica para actualizar una persona
      const person = await ctx.db.person.update({
        where: {
          id: input.id,
        },
        data: {
          full_name: input.fullName,
          phone: input.phone,
          emergency_contact: input.emergencyContact,
          birth_date: input.birthDate,
          updater_id: ctx.session.user.person_id, // Actualizar el actualizador
        },
      });
      return person;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Lógica para eliminar una persona (marcar como eliminada)
      const person = await ctx.db.person.update({
        where: {
          id: input.id,
        },
        data: {
          deleted_at: new Date(),
          updater_id: ctx.session.user.person_id, // Actualizar el actualizador
        },
      });
      return person;
    }),

  searchPersons: organizationProcedure
    .input(z.object({ query: z.string(), organizationId: z.number() }))
    .query(async ({ input, ctx }) => {
      return ctx.db.person.findMany({
        where: {
          full_name: { contains: input.query, mode: 'insensitive' },
          organizations: {
            some: { organization_id: input.organizationId },
          },
        },
        select: {
          id: true,
          full_name: true,
        },
        take: 10, // Limitar resultados de búsqueda
      });
    }),

  addParticipantToCamp: organizationProcedure
    .input(z.object({ personId: z.number(), campId: z.number(), organizationId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const existingParticipation = await ctx.db.campParticipation.findUnique({
        where: {
          person_id_camp_id: {
            person_id: input.personId,
            camp_id: input.campId,
          },
        },
      });

      if (existingParticipation) {
        throw new TRPCError({ code: "CONFLICT", message: "Esta persona ya es participante de este campamento." });
      }

      return ctx.db.campParticipation.create({
        data: {
          person_id: input.personId,
          camp_id: input.campId,
        },
      });
    }),
});
