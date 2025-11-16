import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { auth } from "~/server/auth";

export const personRouter = createTRPCRouter({
  createOrUpdatePerson: protectedProcedure
    .input(
      z.object({
        fullName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
        phone: z.string().optional(),
        emergencyContact: z.string().optional(),
        birthDate: z.date().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const person = await ctx.db.$transaction(async (prisma) => {
        let p;

        // Si el usuario ya tiene un person_id, actualiza el registro existente
        if (ctx.user.person_id) {
          p = await prisma.person.update({
            where: { id: ctx.user.person_id },
            data: {
              full_name: input.fullName,
              phone: input.phone,
              emergency_contact: input.emergencyContact,
              birth_date: input.birthDate,
              updater_id: ctx.user.person_id,
            },
          });
        } else {
          // Si no, crea un nuevo registro de Person
          p = await prisma.person.create({
            data: {
              full_name: input.fullName,
              phone: input.phone,
              emergency_contact: input.emergencyContact,
              birth_date: input.birthDate,
              // No se puede asignar creator_id aquí porque la persona aún no tiene un usuario asociado
            },
          });

          // Actualiza el registro de User para vincularlo con la nueva Person
          await prisma.user.update({
            where: { id: ctx.user.id },
            data: { person_id: p.id },
          });

          // Ahora que la persona está vinculada, podemos actualizar el creator_id y updater_id
          await prisma.person.update({
            where: { id: p.id },
            data: {
              creator_id: p.id,
              updater_id: p.id,
            },
          });
        }

        return p;
      });

      // La sesión se actualizará automáticamente en la siguiente petición gracias
      // al callback de sesión de better-auth. El frontend fuerza una recarga
      // completa, lo que garantiza que se realice una nueva petición.
      return person;
    }),

  // Procedimiento para obtener los datos de una persona
  getPerson: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user.person_id) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "El usuario no tiene un perfil de persona asociado.",
      });
    }

    return ctx.db.person.findUnique({
      where: { id: ctx.user.person_id },
    });
  }),
});
