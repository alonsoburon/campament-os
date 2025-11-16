import { orgProtectedProcedure, createTRPCRouter as router } from "../trpc";
import { z } from "zod";

export const campRouter = router({
  listCamps: orgProtectedProcedure
    .input(z.object({ organizationId: z.number() }))
    .query(async ({ input, ctx }) => { // Añadimos ctx aquí
      return ctx.db.camp.findMany({ where: { organization_id: input.organizationId } });
    }),

  getCampById: orgProtectedProcedure
    .input(z.object({ id: z.number(), organizationId: z.number() }))
    .query(async ({ input, ctx }) => { // Añadimos ctx aquí
      return ctx.db.camp.findUnique({ where: { id: input.id, organization_id: input.organizationId } });
    }),

  createCamp: orgProtectedProcedure
    .input(z.object({ name: z.string(), location: z.string(), start_date: z.date(), end_date: z.date(), fee_cost: z.number().optional().default(0.0), organizationId: z.number() }))
    .mutation(async ({ input, ctx }) => { // Añadimos ctx aquí
      const { organizationId, ...data } = input;
      return ctx.db.camp.create({ data: { ...data, organization_id: organizationId } });
    }),

  updateCamp: orgProtectedProcedure
    .input(z.object({ id: z.number(), organizationId: z.number(), name: z.string().optional(), location: z.string().optional(), start_date: z.date().optional(), end_date: z.date().optional(), fee_cost: z.number().optional() }))
    .mutation(async ({ input, ctx }) => { // Añadimos ctx aquí
      const { id, organizationId, ...data } = input;
      return ctx.db.camp.update({ where: { id, organization_id: organizationId }, data });
    }),

  deleteCamp: orgProtectedProcedure
    .input(z.object({ id: z.number(), organizationId: z.number() }))
    .mutation(async ({ input, ctx }) => { // Añadimos ctx aquí
      return ctx.db.camp.delete({ where: { id: input.id, organization_id: input.organizationId } });
    }),

  listParticipations: orgProtectedProcedure
    .input(z.object({ campId: z.number(), organizationId: z.number() }))
    .query(async ({ input, ctx }) => {
      return ctx.db.campParticipation.findMany({
        where: { camp_id: input.campId },
        include: { person: true },
      });
    }),
});
