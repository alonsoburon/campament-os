import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { ensureUserHasPerson } from "../helpers/ensureUserHasPerson";

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
      const userId = ctx.user.id;
      const personId = ctx.user.person_id; // Puede ser null para usuarios nuevos

      // Usar una transacción para asegurar que todas las operaciones sean atómicas
      const person = await ctx.db.$transaction(async (prisma) => {
        let p;

        if (personId) {
          // Si el usuario ya tiene un perfil (person_id), lo actualizamos.
          p = await prisma.person.update({
            where: { id: personId },
            data: {
              full_name: input.fullName,
              phone: input.phone,
              emergency_contact: input.emergencyContact,
              birth_date: input.birthDate,
              updater_id: personId, // La persona actualiza su propio registro
            },
          });
        } else {
          // Si el usuario es nuevo y no tiene perfil, lo creamos y lo enlazamos.
          // 1. Crear el nuevo registro de Persona.
          p = await prisma.person.create({
            data: {
              full_name: input.fullName,
              phone: input.phone,
              emergency_contact: input.emergencyContact,
              birth_date: input.birthDate,
            },
          });

          // 2. Enlazar la nueva Persona al Usuario actual.
          await prisma.user.update({
            where: { id: userId },
            data: { person_id: p.id },
          });

          // 3. Actualizar los campos de auditoría (creator_id, updater_id) en la nueva Persona.
          // El patrón en tu esquema sugiere una auto-referencia para el creador.
          p = await prisma.person.update({
            where: { id: p.id },
            data: {
              creator_id: p.id,
              updater_id: p.id,
            },
          });
        }

        return p;
      });

      // La sesión se actualizará en la siguiente petición. El frontend fuerza una recarga
      // para asegurar que el middleware y el cliente obtengan la sesión actualizada con el person_id.
      return person;
    }),

  // Procedimiento para obtener los datos de una persona
  getPerson: protectedProcedure.query(async ({ ctx }) => {
    const personId = await ensureUserHasPerson(ctx);

    return ctx.db.person.findUnique({
      where: { id: personId },
    });
  }),
});