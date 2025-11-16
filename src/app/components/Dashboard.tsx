/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import * as React from "react";
import {
  Calendar as CalendarIcon,
  CreditCard,
  CheckSquare,
  MapPin,
  Clock,
  UserCircle,
  DollarSign,
} from "lucide-react";

import { api } from "~/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

const numberFormatter = new Intl.NumberFormat("es-ES");
const currencyFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});

export function Dashboard() {
  const {
    data,
    isLoading,
    isError,
  } = api.dashboard.getSummary.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // Cachea el dashboard por 5 minutos
  });

  if (isLoading) {
    return <div className="grid gap-4 p-4 md:p-6 lg:p-8"><Skeleton className="h-40 w-full" /></div>;
  }

  if (isError) {
    return <div className="p-4 text-destructive">Error al cargar el dashboard.</div>;
  }

  if (!data) {
    return <div className="p-4 text-muted-foreground">No se encontraron datos para el dashboard.</div>;
  }

  return (
    <div className="grid gap-4 p-4 md:p-6 lg:p-8">
      {/* Resumen de Métricas */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total de Campamentos */}
        <Card className="shrink-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Campamentos</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{numberFormatter.format(data.totalCampings)}</div>
            <p className="text-xs text-muted-foreground">
              desde el último mes
            </p>
          </CardContent>
        </Card>

        {/* Total de Tareas */}
        <Card className="shrink-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Tareas</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{numberFormatter.format(data.totalTasks)}</div>
            <p className="text-xs text-muted-foreground">
              pendientes
            </p>
          </CardContent>
        </Card>

        {/* Total de Usuarios */}
        <Card className="shrink-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuarios</CardTitle>
            <UserCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{numberFormatter.format(data.totalUsers)}</div>
            <p className="text-xs text-muted-foreground">
              registrados
            </p>
          </CardContent>
        </Card>

        {/* Total de Ingresos */}
        <Card className="shrink-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Ingresos</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currencyFormatter.format(data.totalIncome)}</div>
            <p className="text-xs text-muted-foreground">
              del último mes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Próximos Campamentos */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {/* Próximos Campamentos */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Próximos Campamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {data.priorityTasks.map((task) => (
                <li key={task.id} className="flex items-start gap-4">
                  <CheckSquare className="mt-1 h-4 w-4 shrink-0 text-primary-600" />
                  <div className="flex-1 space-y-1">
                    <p className="font-medium">{task.title}</p>
                    {task.description && (
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      <CalendarIcon className="mr-1 h-3 w-3" />
                      {task.date}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Próximos Eventos */}
        <Card>
          <CardHeader>
            <CardTitle>Próximos Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {data.priorityEvents.map((event) => (
                <li key={event.id} className="flex items-start gap-4">
                  <MapPin className="mt-1 h-4 w-4 shrink-0 text-primary-600" />
                  <div className="flex-1 space-y-1">
                    <p className="font-medium">{event.title}</p>
                    {event.description && (
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      <Clock className="mr-1 h-3 w-3" />
                      {event.date}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}