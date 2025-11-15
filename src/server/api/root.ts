import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { organizationRouter } from "./routers/organizationRouter";
import { personRouter } from "./routers/personRouter";
import { userRouter } from "./routers/userRouter";
import { dashboardRouter } from "./routers/dashboardRouter";
import { campRouter } from "./routers/campRouter";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  organization: organizationRouter,
  person: personRouter,
  user: userRouter,
  dashboard: dashboardRouter,
  camp: campRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
