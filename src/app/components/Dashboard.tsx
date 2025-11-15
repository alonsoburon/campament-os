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
  CreditCard,
  CheckSquare,
  MapPin,
  Clock,
  UserCircle,
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
import Link from "next/link"; // Importar Link
import { ColorSystemPreview } from "./ColorSystemPreview"; // Importar ColorSystemPreview

const numberFormatter = new Intl.NumberFormat("es-ES");
const currencyFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
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

interface DashboardProps {
  currentModule: string;
}

export function Dashboard({ currentModule }: DashboardProps) {
  const {
    data: data,
    isLoading,
    isError,
  } = api.dashboard.getSummary.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // Cachea el dashboard por 5 minutos
  });

  if (isLoading) {
    return <div className="grid gap-4 p-4 md:p-6 lg:p-8"><Skeleton className="h-40 w-full" /></div>; // Un skeleton simple mientras carga
  }

  if (isError || !data) {
    return <div className="p-4 text-destructive">Error al cargar el dashboard.</div>;
  }

  return (
    <div className="grid gap-4 p-4 md:p-6 lg:p-8">
      <header className="mb-6 space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard General</h1>
        <p className="text-muted-foreground">
          Resumen de todos los campamentos y actividades de tu organización.
        </p>
      </header>

      <ColorSystemPreview onClose={() => {}} /> {/* Renderizar ColorSystemPreview directamente */}

      {data.alerts.length > 0 && (
        <section className="grid gap-4">
          {data.alerts.map((alert) => {
            switch (alert.type) {
              case "payments_pending":
                return (
                  <Card key={alert.id} className="border-orange-500 bg-orange-50/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-orange-700">
                        <CreditCard className="h-5 w-5" />
                        Pagos Pendientes
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-orange-600">
                      Tienes {alert.count} participantes con pagos pendientes por un total de{' '}
                      {currencyFormatter.format(alert.totalAmount)}. Es hora de recordarles!
                    </CardContent>
                  </Card>
                );
              case "tasks_due_soon":
                return (
                  <Card key={alert.id} className="border-yellow-500 bg-yellow-50/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-yellow-700">
                        <CheckSquare className="h-5 w-5" />
                        Tareas Próximas
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-yellow-600">
                      Hay {alert.count} tareas que vencerán en los próximos 7 días.
                      ¡Asegúrate de que todo esté en orden!
                    </CardContent>
                  </Card>
                );
              default:
                return null;
            }
          })}
        </section>
      )}

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Campamentos Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {data.recentCamps.length > 0 ? (
                data.recentCamps.map((camp) => (
                  <li key={camp.id} className="flex items-center gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-secondary-600" />
                        <Link href={`/campamentos/${camp.id}`} className="font-medium">
                          {camp.name}
                        </Link>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {camp.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />{' '}
                          {new Date(camp.start_date).toLocaleDateString()} -{' '}
                          {new Date(camp.end_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <p className="text-muted-foreground">No hay campamentos recientes.</p>
              )}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tareas Prioritarias</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {data.priorityTasks.length > 0 ? (
                data.priorityTasks.map((task) => (
                  <li key={task.id} className="flex items-start gap-4">
                    <CheckSquare className="mt-1 h-4 w-4 flex-shrink-0 text-primary-600" />
                    <div className="flex-1 space-y-1">
                      <p className="font-medium">{task.title}</p>
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="h-3 w-3" />{' '}
                          Vence el {new Date(task.due_date).toLocaleDateString()}
                        </span>
                        {task.assignedTo && (
                          <span className="flex items-center gap-1">
                            <UserCircle className="h-3 w-3" /> {task.assignedTo.full_name}
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <p className="text-muted-foreground">No hay tareas prioritarias.</p>
              )}
            </ul>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Métricas Clave</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Participantes Totales</p>
                <p className="text-3xl font-bold">{numberFormatter.format(data.metrics.totalParticipants)}</p>
                <Progress value={70} className="mt-2 h-2" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Campamentos Activos</p>
                <p className="text-3xl font-bold">{numberFormatter.format(data.metrics.activeCamps)}</p>
                <Progress value={50} className="mt-2 h-2" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ingresos Potenciales</p>
                <p className="text-3xl font-bold">{currencyFormatter.format(data.metrics.potentialRevenue)}</p>
                <Progress value={90} className="mt-2 h-2" />
              </div>
            </div>
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

