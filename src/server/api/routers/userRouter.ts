import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  // Devuelve los datos del usuario actual, incluyendo el ID de la persona asociada
  me: protectedProcedure.query(({ ctx }) => {
    return ctx.db.user.findUnique({
      where: { id: ctx.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        person_id: true, // Incluir el ID de la persona
      },
    });
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
      .filter(
        (user): user is typeof user & { person: NonNullable<typeof user.person> } =>
          user.person !== null
      )
      .map((user) => ({
        userId: user.id,
        fullName:
          user.person.full_name ??
          user.name ??
          user.email ??
          "Usuario sin nombre",
        email: user.email,
        personId: user.person.id,
        memberships: user.person.organizations.map((membership) => ({
          organizationId: membership.organization_id,
          organizationName: membership.organization.name,
          roleId: membership.role_id,
          roleName: membership.role.name,
        })),
        isCurrent: user.id === ctx.user.id,
      }));
  }),
  acceptInvitation: protectedProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async () => {
      // TODO: Implement invitation acceptance logic
      throw new Error("Not implemented");
    }),
});
