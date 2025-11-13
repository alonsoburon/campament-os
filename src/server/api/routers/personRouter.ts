import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

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
});
