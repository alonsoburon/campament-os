"use client";

import * as React from "react";
import {
  AlertCircle,
  AlertTriangle,
  Calendar as CalendarIcon,
  CheckCircle,
  DollarSign,
  TrendingUp,
  Users as UsersIcon,
} from "lucide-react";

import { api } from "~/trpc/react";

import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Badge } from "./ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Progress } from "./ui/progress";
import { Skeleton } from "./ui/skeleton";

const numberFormatter = new Intl.NumberFormat("es-ES");
const currencyFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const ALERT_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  health: AlertTriangle,
  payments: DollarSign,
  default: AlertCircle,
};

const ALERT_STYLE_MAP = {
  negative: "border-negative-500 bg-negative-50 text-negative-900",
  warning: "border-secondary-500 bg-secondary-50 text-secondary-900",
  neutral: "border-border bg-card text-foreground",
} as const;

const ALERT_ICON_COLOR_MAP = {
  negative: "text-negative-600",
  warning: "text-secondary-600",
  neutral: "text-muted-foreground",
} as const;

type AlertTone = keyof typeof ALERT_STYLE_MAP;

function isValidAlertTone(tone: string | undefined): tone is AlertTone {
  return tone !== undefined && tone in ALERT_STYLE_MAP;
}

const METRIC_CONFIG = {
  "upcoming-camps": {
    Icon: CalendarIcon,
    iconClass: "text-secondary-600",
    borderClass: "border-secondary-600",
  },
  "active-members": {
    Icon: UsersIcon,
    iconClass: "text-positive-600",
    borderClass: "border-positive-600",
  },
  "critical-tasks": {
    Icon: AlertCircle,
    iconClass: "text-neutral-700",
    borderClass: "border-neutral-600",
  },
  budget: {
    Icon: TrendingUp,
    iconClass: "text-secondary-700",
    borderClass: "border-secondary-700",
  },
} as const;

function formatCampDateRange(start: Date, end: Date) {
  const formatter = new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
  });

  return `${formatter.format(start)} – ${formatter.format(end)}`;
}

function formatMetricValue(id: string, value: number) {
  if (id === "budget") {
    return currencyFormatter.format(value);
  }

  return numberFormatter.format(value);
}

type DashboardProps = {
  currentModule: string;
};

export function Dashboard({ currentModule }: DashboardProps) {
  const { data, isLoading, isError } = api.dashboard.overview.useQuery(undefined, {
    enabled: currentModule === "inicio",
    refetchOnWindowFocus: false,
  });

  if (currentModule !== "inicio") {
    return (
      <div className="mx-auto w-full max-w-7xl p-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-semibold">{getModuleTitle(currentModule)}</h1>
          <p className="text-muted-foreground">
            {getModuleDescription(currentModule)}
          </p>
        </div>

        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Contenido del módulo en desarrollo.
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-7xl space-y-8 p-8">
        <Skeleton className="h-6 w-40" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((index) => (
            <Skeleton key={index} className="h-24 rounded-xl" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-56 rounded-2xl" />
          <Skeleton className="h-56 rounded-2xl" />
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="mx-auto w-full max-w-5xl p-8">
        <Alert>
          <AlertTitle>No pudimos cargar los datos del tablero</AlertTitle>
          <AlertDescription>
            Actualiza la página o vuelve a intentarlo en unos instantes.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 p-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Panel General</h1>
        <p className="text-muted-foreground">
          Vista general del sistema con métricas clave y alertas.
        </p>
      </header>

      {data.alerts.length > 0 && (
        <section className="grid gap-4">
          {data.alerts.map((alert) => {
            const tone: AlertTone = isValidAlertTone(alert.tone) ? alert.tone : "neutral";
            const Icon = ALERT_ICON_MAP[alert.id] ?? ALERT_ICON_MAP.default;
            const style = ALERT_STYLE_MAP[tone];
            const iconColor = ALERT_ICON_COLOR_MAP[tone];

            return (
              <Alert key={alert.id} className={style}>
                <Icon className={`h-4 w-4 ${iconColor}`} />
                <AlertTitle>{alert.title}</AlertTitle>
                <AlertDescription>{alert.description}</AlertDescription>
              </Alert>
            );
          })}
        </section>
      )}

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {data.metrics.map((metric) => {
          const config = METRIC_CONFIG[metric.id as keyof typeof METRIC_CONFIG];
          const Icon = config?.Icon ?? CalendarIcon;
          const borderClass = config?.borderClass ?? "border-border";
          const iconClass = config?.iconClass ?? "text-muted-foreground";

          return (
            <Card
              key={metric.id}
              className={`border-l-4 ${borderClass}`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base">{metric.title}</CardTitle>
                <Icon className={`h-5 w-5 ${iconClass}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">
                  {formatMetricValue(metric.id, metric.value)}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {metric.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Próximos campamentos</CardTitle>
            <CardDescription>
              Campamentos programados en las próximas semanas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.upcomingCamps.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay campamentos programados en los próximos 30 días.
              </p>
            ) : (
              data.upcomingCamps.map((camp) => {
                const statusVariant = camp.status === "En curso" ? "default" : "secondary";

                return (
                  <div
                    key={camp.id}
                    className="flex items-center justify-between rounded-lg border border-border p-4"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-secondary-600" />
                        <span className="font-medium">{camp.name}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="h-3 w-3" />
                          {formatCampDateRange(new Date(camp.startDate), new Date(camp.endDate))}
                        </span>
                        <span className="flex items-center gap-1">
                          <UsersIcon className="h-3 w-3" />
                          {camp.participants} participante{camp.participants === 1 ? "" : "s"}
                        </span>
                        {camp.pendingPayments > 0 && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {camp.pendingPayments} pago{camp.pendingPayments === 1 ? "" : "s"} pendiente{camp.pendingPayments === 1 ? "" : "s"}
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge variant={statusVariant}>{camp.status}</Badge>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tareas pendientes</CardTitle>
            <CardDescription>
              Tareas que requieren atención inmediata.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.tasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay tareas críticas en este momento.
              </p>
            ) : (
              data.tasks.map((task) => {
                const isHighPriority = task.priority === "Urgente" || task.priority === "Alta";
                return (
                  <div
                    key={task.id}
                    className="flex items-center justify-between rounded-lg border border-border p-4"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle
                          className={`h-4 w-4 ${isHighPriority ? "text-negative-600" : "text-secondary-600"}`}
                        />
                        <span className="font-medium">{task.title}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <Badge variant="outline" className="border-border text-muted-foreground">
                          {task.module}
                        </Badge>
                        <span>{task.dueInLabel}</span>
                      </div>
                    </div>
                    <Badge variant={isHighPriority ? "destructive" : "secondary"}>
                      {task.priority}
                    </Badge>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>Estado de módulos</CardTitle>
            <CardDescription>
              Progreso de configuración y uso del sistema.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {data.modulesProgress.map((module) => (
              <div key={module.id}>
                <div className="mb-2 flex items-center justify-between text-sm font-medium">
                  <span>{module.name}</span>
                  <span className="text-muted-foreground">{module.progress}%</span>
                </div>
                <Progress value={module.progress} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function getModuleTitle(moduleId: string): string {
  const titles: Record<string, string> = {
    campamentos: "Campamentos",
    "campamentos-lista": "Listado de campamentos",
    "campamentos-calendario": "Calendario de campamentos",
    personas: "Personas",
    "personas-scouts": "Scouts",
    "personas-lideres": "Líderes",
    "personas-tutores": "Tutores",
    inventario: "Inventario",
    "inventario-utensilios": "Utensilios",
    "inventario-equipamiento": "Equipamiento",
    alimentacion: "Alimentación",
    "alimentacion-ingredientes": "Ingredientes",
    "alimentacion-platos": "Platos",
    "alimentacion-menus": "Menús",
    transporte: "Transporte",
    "transporte-vehiculos": "Vehículos",
    "transporte-asignaciones": "Asignaciones de transporte",
    alojamiento: "Alojamiento",
    "alojamiento-tipos": "Tipos de alojamiento",
    "alojamiento-asignaciones": "Asignaciones de alojamiento",
    actividades: "Actividades",
    "actividades-catalogo": "Catálogo de actividades",
    "actividades-agenda": "Agenda de actividades",
    salud: "Salud",
    "salud-alergias": "Alergias",
    "salud-info-medica": "Información médica",
    tareas: "Tareas",
    "tareas-kanban": "Tablero Kanban",
    "tareas-checklist": "Checklists",
    presupuesto: "Presupuesto",
    "presupuesto-campamentos": "Presupuesto por campamento",
    "presupuesto-global": "Vista global de presupuesto",
    reportes: "Reportes",
    configuracion: "Configuración",
    "configuracion-roles": "Roles y permisos",
    "configuracion-grupos": "Grupos y unidades",
    "configuracion-proveedores": "Proveedores",
  };

  return titles[moduleId] ?? "Módulo";
}

function getModuleDescription(moduleId: string): string {
  const descriptions: Record<string, string> = {
    campamentos: "Gestión completa de campamentos scouts.",
    "campamentos-lista": "Vista general de todos los campamentos.",
    "campamentos-calendario":
      "Visualización en calendario de campamentos y actividades.",
    personas: "Administración de participantes, líderes y tutores.",
    inventario: "Control de utensilios y equipamiento.",
    alimentacion: "Gestión de ingredientes, platos y menús.",
    transporte: "Coordinación de vehículos y rutas.",
    alojamiento: "Administración de espacios y asignaciones.",
    actividades: "Planificación y seguimiento de actividades.",
    salud: "Registro de información médica y alergias.",
    tareas: "Organización y seguimiento de tareas.",
    presupuesto: "Control financiero y presupuestario.",
    reportes: "Análisis y reportes del sistema.",
    configuracion: "Configuración general del sistema.",
  };

  return descriptions[moduleId] ?? "Gestión del módulo.";
}

