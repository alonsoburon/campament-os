import { TRPCError } from "@trpc/server";

/**
 * Helper para asegurar que el usuario tenga una persona asociada.
 * Si no existe, la crea automáticamente con la información básica del usuario.
 *
 * @param ctx - Contexto de tRPC con user y db
 * @returns El ID de la persona (existente o recién creada)
 */
export async function ensureUserHasPerson(ctx: {
  user: { id: string; person_id?: number | null };
  db: any;
}): Promise<number> {
  if (ctx.user.person_id) {
    return ctx.user.person_id;
  }

  // Verificar que el user.id exista
  if (!ctx.user.id) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Usuario no autenticado.",
    });
  }

  const user = await ctx.db.user.findUnique({
    where: { id: ctx.user.id },
    select: { id: true, name: true, email: true, person_id: true },
  });

  if (!user) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Usuario no encontrado.",
    });
  }

  // Si el usuario ya tiene un person_id, retornarlo
  if (user.person_id) {
    return user.person_id;
  }

  // Si no tiene person_id, crear uno nuevo
  const newPerson = await ctx.db.person.create({
    data: {
      full_name: user.name ?? user.email ?? "Usuario",
    },
  });

  await ctx.db.user.update({
    where: { id: user.id },
    data: { person_id: newPerson.id },
  });

  console.log(`✅ Persona creada automáticamente para usuario ${user.email}: ID ${newPerson.id}`);
  return newPerson.id;
}
