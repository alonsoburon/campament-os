import { createTRPCRouter, protectedProcedure } from "../trpc";

const TARGETS = {
	Campamentos: 5,
	Personas: 40,
	Inventario: 30,
	Alimentación: 25,
	Transporte: 10,
	Alojamiento: 10,
	Salud: 20,
	Tareas: 35,
} as const;

const MODULE_ORDER = [
	"Campamentos",
	"Personas",
	"Inventario",
	"Alimentación",
	"Transporte",
	"Alojamiento",
	"Salud",
	"Tareas",
] as const;

function normalizeProgress(count: number, target: number) {
	if (!count || count <= 0) {
		return 0;
	}

	return Math.min(100, Math.round((count / target) * 100));
}

function addDays(date: Date, days: number) {
	const copy = new Date(date);
	copy.setDate(copy.getDate() + days);
	return copy;
}

function differenceInCalendarDays(from: Date, to: Date) {
	const start = new Date(
		from.getFullYear(),
		from.getMonth(),
		from.getDate(),
	).getTime();
	const end = new Date(to.getFullYear(), to.getMonth(), to.getDate()).getTime();
	const diff = end - start;
	return Math.round(diff / (1000 * 60 * 60 * 24));
}

const PRIORITY_MAP = {
	LOW: "Baja",
	MEDIUM: "Media",
	HIGH: "Alta",
	URGENT: "Urgente",
} as const;

export const dashboardRouter = createTRPCRouter({
	getSummary: protectedProcedure.query(async ({ ctx }) => {
		const organizationId = ctx.user.organization_id;
		if (!organizationId) {
			return {
				totalCampings: 0,
				totalTasks: 0,
				totalUsers: 0,
				totalIncome: 0,
				priorityTasks: [],
				priorityEvents: [],
			};
		}
	
		const now = new Date();
		const nextMonth = new Date();
		nextMonth.setMonth(now.getMonth() + 1);
	
		const [
			totalCampings,
			totalTasks,
			totalUsers,
			incomeAggregate,
			priorityTasksRaw,
		] = await Promise.all([
			ctx.db.camp.count({ where: { organization_id: organizationId } }),
			ctx.db.task.count({ where: { camp: { organization_id: organizationId } } }),
			ctx.db.organizationMember.count({ where: { organization_id: organizationId } }),
			ctx.db.payment.aggregate({
				where: {
					camp_participation: {
						camp: {
							organization_id: organizationId,
							end_date: {
								gte: new Date(now.getFullYear(), now.getMonth(), 1),
								lt: new Date(now.getFullYear(), now.getMonth() + 1, 1),
							},
						},
					},
				},
				_sum: {
					amount: true,
				},
			}),
			ctx.db.task.findMany({
				where: {
					camp: { organization_id: organizationId },
					status: { in: ["PENDING", "IN_PROGRESS"] },
					priority: { in: ["HIGH", "URGENT"] },
				},
				orderBy: [{ due_date: "asc" }],
				take: 5,
			}),
		]);
	
		const priorityTasks = priorityTasksRaw.map((task: { id: string; title: string | null; description: string | null; due_date: Date | null; }) => ({
			id: task.id,
			title: task.title,
			description: task.description,
			date: task.due_date?.toLocaleDateString("es-ES") ?? "Sin fecha",
		}));
	
		const priorityEventsRaw = await ctx.db.camp.findMany({
			where: {
				organization_id: organizationId,
				start_date: {
					gte: now,
					lte: nextMonth,
				},
			},
			orderBy: { start_date: "asc" },
			take: 5,
		});
	
		const priorityEvents = priorityEventsRaw.map((event) => ({
			id: event.id,
			title: event.name,
			description: `Inicia en ${differenceInCalendarDays(now, event.start_date)} días`,
			date: event.start_date.toLocaleDateString("es-ES"),
		}));
	
		return {
			totalCampings,
			totalTasks,
			totalUsers,
			totalIncome: incomeAggregate._sum.amount ?? 0,
			priorityTasks,
			priorityEvents,
		};
	}),
});