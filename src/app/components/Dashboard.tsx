"use client";
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
        <Alert className="border-negative-500 bg-negative-50 text-negative-900">
          <AlertTriangle className="h-4 w-4 text-negative-600" />
          <AlertTitle>Alertas de salud</AlertTitle>
          <AlertDescription>
            3 participantes requieren atención especial para el próximo
            campamento.
          </AlertDescription>
        </Alert>
        <Alert className="border-secondary-500 bg-secondary-50 text-secondary-900">
          <DollarSign className="h-4 w-4 text-secondary-600" />
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
            Icon: CalendarIcon,
            iconClass: "text-secondary-600",
            borderClass: "border-secondary-600",
          },
          {
            title: "Participantes activos",
            value: "287",
            description: (
              <>
                <span className="text-positive-600">+12%</span> vs mes anterior
              </>
            ),
            Icon: UsersIcon,
            iconClass: "text-positive-600",
            borderClass: "border-positive-600",
          },
          {
            title: "Tareas críticas",
            value: "8",
            description: "2 vencen en 48 horas",
            Icon: AlertCircle,
            iconClass: "text-neutral-700",
            borderClass: "border-neutral-600",
          },
          {
            title: "Presupuesto actual",
            value: "$24,500",
            description: "85% del presupuesto anual",
            Icon: TrendingUp,
            iconClass: "text-secondary-700",
            borderClass: "border-secondary-700",
          },
        ].map((metric) => {
          const Icon = metric.Icon;
          return (
            <Card
              key={metric.title}
              className={`border-l-4 ${metric.borderClass}`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base">{metric.title}</CardTitle>
                <Icon className={`h-5 w-5 ${metric.iconClass}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">{metric.value}</div>
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
            {[
              {
                name: "Campamento Primavera 2025",
                date: "15-17 Nov 2025",
                participants: 45,
                status: "Confirmado",
                iconClass: "text-secondary-600",
              },
              {
                name: "Salida de Patrulla",
                date: "22-24 Nov 2025",
                participants: 12,
                status: "Planificación",
                iconClass: "text-secondary-600",
              },
              {
                name: "Campamento Navideño",
                date: "20-22 Dic 2025",
                participants: 67,
                status: "Confirmado",
                iconClass: "text-secondary-600",
              },
            ].map((camp) => (
              <div
                key={camp.name}
                className="flex items-center justify-between rounded-lg border border-border p-4"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <CalendarIcon
                      className={`h-4 w-4 ${camp.iconClass}`}
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
            iconClass: "text-secondary-600",
            badgeClass: "border-secondary-600 text-secondary-600",
              },
              {
                title: "Revisar alergias participantes",
                module: "Salud",
                priority: "Alta",
                dueDate: "En 3 días",
            iconClass: "text-negative-600",
            badgeClass: "border-negative-600 text-negative-600",
              },
              {
                title: "Planificar menús campamento",
                module: "Alimentación",
                priority: "Media",
                dueDate: "En 5 días",
            iconClass: "text-secondary-700",
            badgeClass: "border-secondary-700 text-secondary-700",
              },
              {
                title: "Verificar equipamiento",
                module: "Inventario",
                priority: "Media",
                dueDate: "En 1 semana",
            iconClass: "text-neutral-600",
            badgeClass: "border-neutral-600 text-neutral-600",
              },
            ].map((task) => (
              <div
                key={task.title}
                className="flex items-center justify-between rounded-lg border border-border p-4"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                <CheckCircle className={`h-4 w-4 ${task.iconClass}`} />
                    <span className="font-medium">{task.title}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <Badge
                      variant="outline"
                  className={task.badgeClass}
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
          { name: "Campamentos", progress: 85 },
          { name: "Personas", progress: 92 },
          { name: "Inventario", progress: 65 },
          { name: "Alimentación", progress: 78 },
          { name: "Transporte", progress: 70 },
          { name: "Alojamiento", progress: 73 },
          { name: "Salud", progress: 88 },
          { name: "Tareas", progress: 60 },
        ].map((module) => (
          <div key={module.name}>
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

