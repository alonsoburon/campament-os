"use client";

import type { CSSProperties } from "react";
import {
  AlertCircle,
  AlertTriangle,
  Calendar as CalendarIcon,
  CheckCircle,
  Clock,
  DollarSign,
  TrendingUp,
  Users as UsersIcon,
} from "lucide-react";

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

type DashboardProps = {
  currentModule: string;
};

export function Dashboard({ currentModule }: DashboardProps) {
  if (currentModule !== "inicio") {
    return (
      <div className="mx-auto w-full max-w-7xl p-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-semibold">
            {getModuleTitle(currentModule)}
          </h1>
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

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 p-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Panel General</h1>
        <p className="text-muted-foreground">
          Vista general del sistema con métricas clave y alertas.
        </p>
      </header>

      <section className="grid gap-4">
        <Alert className="border-[var(--color-negative-500)] bg-[var(--color-negative-50)] text-[var(--color-negative-900)]">
          <AlertTriangle
            className="h-4 w-4"
            style={{ color: "var(--color-negative-600)" }}
          />
          <AlertTitle>Alertas de salud</AlertTitle>
          <AlertDescription>
            3 participantes requieren atención especial para el próximo
            campamento.
          </AlertDescription>
        </Alert>
        <Alert className="border-[var(--color-primary-500)] bg-[var(--color-primary-50)] text-[var(--color-primary-900)]">
          <DollarSign
            className="h-4 w-4"
            style={{ color: "var(--color-primary-600)" }}
          />
          <AlertTitle>Pagos pendientes</AlertTitle>
          <AlertDescription>
            12 pagos pendientes por un total de $4,850 USD.
          </AlertDescription>
        </Alert>
      </section>

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "Próximos campamentos",
            value: "3",
            description: "En los próximos 30 días",
            icon: (
              <CalendarIcon
                className="h-5 w-5"
                style={{ color: "var(--color-primary-600)" }}
              />
            ),
            borderColor: "var(--color-primary-600)",
          },
          {
            title: "Participantes activos",
            value: "287",
            description: (
              <>
                <span style={{ color: "var(--color-positive-600)" }}>+12%</span> vs
                mes anterior
              </>
            ),
            icon: (
              <UsersIcon
                className="h-5 w-5"
                style={{ color: "var(--color-secondary-600)" }}
              />
            ),
            borderColor: "var(--color-secondary-600)",
          },
          {
            title: "Tareas críticas",
            value: "8",
            description: "2 vencen en 48 horas",
            icon: (
              <AlertCircle
                className="h-5 w-5"
                style={{ color: "var(--color-neutral-700)" }}
              />
            ),
            borderColor: "var(--color-neutral-600)",
          },
          {
            title: "Presupuesto actual",
            value: "$24,500",
            description: "85% del presupuesto anual",
            icon: (
              <TrendingUp
                className="h-5 w-5"
                style={{ color: "var(--color-primary-700)" }}
              />
            ),
            borderColor: "var(--color-primary-700)",
          },
        ].map((metric) => (
          <Card
            key={metric.title}
            className="border-l-4"
            style={{ borderLeftColor: metric.borderColor }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base">{metric.title}</CardTitle>
              {metric.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{metric.value}</div>
              <p className="mt-1 text-sm text-muted-foreground">
                {metric.description}
              </p>
            </CardContent>
          </Card>
        ))}
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
            {[
              {
                name: "Campamento Primavera 2025",
                date: "15-17 Nov 2025",
                participants: 45,
                status: "Confirmado",
                color: "var(--color-primary-600)",
              },
              {
                name: "Salida de Patrulla",
                date: "22-24 Nov 2025",
                participants: 12,
                status: "Planificación",
                color: "var(--color-primary-600)",
              },
              {
                name: "Campamento Navideño",
                date: "20-22 Dic 2025",
                participants: 67,
                status: "Confirmado",
                color: "var(--color-primary-600)",
              },
            ].map((camp) => (
              <div
                key={camp.name}
                className="flex items-center justify-between rounded-lg border border-border p-4"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <CalendarIcon
                      className="h-4 w-4"
                      style={{ color: camp.color }}
                    />
                    <span className="font-medium">{camp.name}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {camp.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <UsersIcon className="h-3 w-3" />
                      {camp.participants} participantes
                    </span>
                  </div>
                </div>
                <Badge
                  variant={camp.status === "Confirmado" ? "default" : "secondary"}
                  style={
                    camp.status === "Confirmado"
                      ? { backgroundColor: camp.color, color: "white" }
                      : undefined
                  }
                >
                  {camp.status}
                </Badge>
              </div>
            ))}
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
            {[
              {
                title: "Confirmar transporte",
                module: "Transporte",
                priority: "Alta",
                dueDate: "En 2 días",
                color: "var(--color-secondary-600)",
              },
              {
                title: "Revisar alergias participantes",
                module: "Salud",
                priority: "Alta",
                dueDate: "En 3 días",
                color: "var(--color-negative-600)",
              },
              {
                title: "Planificar menús campamento",
                module: "Alimentación",
                priority: "Media",
                dueDate: "En 5 días",
                color: "var(--color-primary-700)",
              },
              {
                title: "Verificar equipamiento",
                module: "Inventario",
                priority: "Media",
                dueDate: "En 1 semana",
                color: "var(--color-neutral-600)",
              },
            ].map((task) => (
              <div
                key={task.title}
                className="flex items-center justify-between rounded-lg border border-border p-4"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle
                      className="h-4 w-4"
                      style={{ color: task.color }}
                    />
                    <span className="font-medium">{task.title}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <Badge
                      variant="outline"
                      style={{ borderColor: task.color, color: task.color }}
                    >
                      {task.module}
                    </Badge>
                    <span>{task.dueDate}</span>
                  </div>
                </div>
                <Badge
                  variant={task.priority === "Alta" ? "destructive" : "secondary"}
                >
                  {task.priority}
                </Badge>
              </div>
            ))}
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
            {[
              { name: "Campamentos", progress: 85, color: "var(--color-primary-600)" },
              { name: "Personas", progress: 92, color: "var(--color-secondary-600)" },
              { name: "Inventario", progress: 65, color: "var(--color-neutral-600)" },
              { name: "Alimentación", progress: 78, color: "var(--color-primary-700)" },
              { name: "Transporte", progress: 70, color: "var(--color-secondary-700)" },
              { name: "Alojamiento", progress: 73, color: "var(--color-primary-500)" },
              { name: "Salud", progress: 88, color: "var(--color-negative-600)" },
              { name: "Tareas", progress: 60, color: "var(--color-neutral-700)" },
            ].map((module) => {
              const progressStyle = {
                "--progress-background": module.color,
              } as React.CSSProperties;

              return (
                <div key={module.name}>
                  <div className="mb-2 flex items-center justify-between text-sm font-medium">
                    <span>{module.name}</span>
                    <span className="text-muted-foreground">
                      {module.progress}%
                    </span>
                  </div>
                  <Progress
                    value={module.progress}
                    className="h-2"
                    style={progressStyle as React.CSSProperties}
                  />
                </div>
              );
            })}
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

