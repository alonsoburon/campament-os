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
  overview: protectedProcedure.query(async ({ ctx }) => {
    const organizationId = ctx.session.user.organization_id;

    if (!organizationId) {
      return {
        alerts: [],
        metrics: [],
        upcomingCamps: [],
        tasks: [],
        modulesProgress: [],
        summary: {
          upcomingCampsCount: 0,
          activeParticipants: 0,
          pendingPaymentsCount: 0,
          pendingPaymentsAmount: 0,
          criticalTasksCount: 0,
        },
      };
    }

    const now = new Date();
    const nextMonth = addDays(now, 30);

    const [
      upcomingCampsRaw,
      totalMembers,
      tasksRaw,
      utensilCount,
      ingredientCount,
      transportCount,
      accommodationCount,
      allergyCount,
      campCount,
      taskCount,
      pendingParticipations,
      budgetAggregate,
      severeAllergyCount,
    ] = await Promise.all([
      ctx.db.camp.findMany({
        where: {
          organization_id: organizationId,
          start_date: {
            gte: now,
            lte: nextMonth,
          },
        },
        orderBy: { start_date: "asc" },
        take: 4,
        include: {
          camp_participations: {
            select: { payment_made: true },
          },
        },
      }),
      ctx.db.organizationMember.count({
        where: { organization_id: organizationId },
      }),
      ctx.db.task.findMany({
        where: {
          camp: { organization_id: organizationId },
          status: { in: ["PENDING", "IN_PROGRESS"] },
        },
        orderBy: [{ priority: "desc" }, { due_date: "asc" }],
        take: 6,
        include: {
          camp: {
            select: { name: true },
          },
        },
      }),
      ctx.db.utensil.count({
        where: { organization_id: organizationId },
      }),
      ctx.db.ingredient.count({
        where: { organization_id: organizationId },
      }),
      ctx.db.transport.count({
        where: { camp: { organization_id: organizationId } },
      }),
      ctx.db.accommodation.count({
        where: { camp: { organization_id: organizationId } },
      }),
      ctx.db.allergy.count({
        where: {
          person: {
            organizations: {
              some: { organization_id: organizationId },
            },
          },
        },
      }),
      ctx.db.camp.count({
        where: { organization_id: organizationId },
      }),
      ctx.db.task.count({
        where: { camp: { organization_id: organizationId } },
      }),
      ctx.db.campParticipation.findMany({
        where: {
          payment_made: false,
          camp: { organization_id: organizationId },
        },
        include: {
          camp: {
            select: {
              id: true,
              fee_cost: true,
            },
          },
        },
      }),
      ctx.db.budget.aggregate({
        where: {
          camp: { organization_id: organizationId },
        },
        _sum: { estimated_total: true },
      }),
      ctx.db.allergy.count({
        where: {
          severity: { in: ["SEVERE", "CRITICAL"] },
          person: {
            camp_participations: {
              some: {
                camp: {
                  organization_id: organizationId,
                  start_date: {
                    gte: now,
                    lte: nextMonth,
                  },
                },
              },
            },
          },
        },
      }),
    ]);

    const upcomingCamps = upcomingCampsRaw.map((camp) => {
      const participants = camp.camp_participations.length;
      const pendingPayments = camp.camp_participations.filter(
        (participation) => !participation.payment_made,
      ).length;

      return {
        id: camp.id,
        name: camp.name,
        startDate: camp.start_date,
        endDate: camp.end_date,
        participants,
        pendingPayments,
        status: camp.start_date <= now ? "En curso" : "Programado",
      };
    });

    const pendingPaymentsAmount = pendingParticipations.reduce(
      (acc, participation) =>
        acc + (participation.camp?.fee_cost ?? 0),
      0,
    );

    const pendingPaymentsCount = pendingParticipations.length;

    const tasks = tasksRaw.map((task) => {
      const dueDate = task.due_date;
      let dueInLabel = "Sin fecha límite";

      if (dueDate) {
        const daysLeft = differenceInCalendarDays(now, dueDate);
        if (daysLeft < 0) {
          dueInLabel = `Vencida hace ${Math.abs(daysLeft)} día${
            Math.abs(daysLeft) === 1 ? "" : "s"
          }`;
        } else if (daysLeft === 0) {
          dueInLabel = "Vence hoy";
        } else {
          dueInLabel = `En ${daysLeft} día${daysLeft === 1 ? "" : "s"}`;
        }
      }

      return {
        id: task.id,
        title: task.title,
        module: task.camp?.name ?? "Campamento",
        priority: PRIORITY_MAP[task.priority],
        dueDate,
        dueInLabel,
      };
    });

    const criticalTasksCount = tasks.filter(
      (task) =>
        task.priority === "Urgente" ||
        task.priority === "Alta" ||
        (task.dueDate &&
          differenceInCalendarDays(now, task.dueDate) <= 2),
    ).length;

    const modulesProgress = MODULE_ORDER.map((moduleName) => {
      const countMap: Record<(typeof MODULE_ORDER)[number], number> = {
        Campamentos: campCount,
        Personas: totalMembers,
        Inventario: utensilCount,
        Alimentación: ingredientCount,
        Transporte: transportCount,
        Alojamiento: accommodationCount,
        Salud: allergyCount,
        Tareas: taskCount,
      };

      return {
        id: moduleName.toLowerCase(),
        name: moduleName,
        progress: normalizeProgress(
          countMap[moduleName],
          TARGETS[moduleName],
        ),
      };
    });

    const alerts = [
      {
        id: "health",
        title: "Alertas de salud",
        description:
          severeAllergyCount > 0
            ? `${severeAllergyCount} participante${
                severeAllergyCount === 1 ? "" : "s"
              } con alergias críticas en próximos campamentos.`
            : "No hay alergias críticas registradas en los campamentos próximos.",
        tone: severeAllergyCount > 0 ? "negative" : "neutral",
      },
      {
        id: "payments",
        title: "Pagos pendientes",
        description:
          pendingPaymentsCount > 0
            ? `${pendingPaymentsCount} pago${
                pendingPaymentsCount === 1 ? "" : "s"
              } en espera por un total estimado de ${pendingPaymentsAmount.toLocaleString("es-ES", {
                style: "currency",
                currency: "USD",
              })}.`
            : "Todos los pagos de campamentos están al día.",
        tone: pendingPaymentsCount > 0 ? "warning" : "neutral",
      },
    ];

    const metrics = [
      {
        id: "upcoming-camps",
        title: "Próximos campamentos",
        value: upcomingCamps.length,
        description: "En los próximos 30 días",
      },
      {
        id: "active-members",
        title: "Participantes activos",
        value: totalMembers,
        description: `${totalMembers === 1 ? "Un" : `${totalMembers}`} miembro en tu organización`,
      },
      {
        id: "critical-tasks",
        title: "Tareas críticas",
        value: criticalTasksCount,
        description:
          criticalTasksCount > 0
            ? `${criticalTasksCount} requieren atención inmediata`
            : "Sin tareas urgentes por ahora",
      },
      {
        id: "budget",
        title: "Presupuesto estimado",
        value: Math.round(
          budgetAggregate._sum.estimated_total ?? 0,
        ),
        description: "Suma estimada de todos los campamentos",
      },
    ];

    return {
      alerts,
      metrics,
      upcomingCamps,
      tasks,
      modulesProgress,
      summary: {
        upcomingCampsCount: upcomingCamps.length,
        activeParticipants: totalMembers,
        pendingPaymentsCount,
        pendingPaymentsAmount,
        criticalTasksCount,
      },
    };
  }),
});

