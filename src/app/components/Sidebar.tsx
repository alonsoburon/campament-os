"use client";

import * as React from "react";
import {
  BarChart3,
  Bus,
  Calendar,
  CheckSquare,
  ChevronRight,
  DollarSign,
  Heart,
  Home,
  Hotel,
  Palette,
  Package,
  Settings,
  Sparkles,
  Users,
  Utensils,
} from "lucide-react";

import { cn } from "./ui/utils";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";

type ModuleSubItem = {
  id: string;
  label: string;
};

type ModuleItem = {
  id: string;
  label: string;
  icon: React.ReactElement;
  color: string;
  subItems?: ModuleSubItem[];
};

const MODULES: ModuleItem[] = [
  {
    id: "inicio",
    label: "Inicio",
    icon: <Home className="h-5 w-5" />,
    color: "text-[var(--color-primary-600)]",
  },
  {
    id: "campamentos",
    label: "Campamentos",
    icon: <Calendar className="h-5 w-5" />,
    color: "text-[var(--color-primary-600)]",
    subItems: [
      { id: "campamentos-lista", label: "Listado" },
      { id: "campamentos-calendario", label: "Calendario" },
    ],
  },
  {
    id: "personas",
    label: "Personas",
    icon: <Users className="h-5 w-5" />,
    color: "text-[var(--color-secondary-600)]",
    subItems: [
      { id: "personas-scouts", label: "Scouts" },
      { id: "personas-lideres", label: "Líderes" },
      { id: "personas-tutores", label: "Tutores" },
    ],
  },
  {
    id: "inventario",
    label: "Inventario",
    icon: <Package className="h-5 w-5" />,
    color: "text-[var(--color-neutral-600)]",
    subItems: [
      { id: "inventario-utensilios", label: "Utensilios" },
      { id: "inventario-equipamiento", label: "Equipamiento" },
    ],
  },
  {
    id: "alimentacion",
    label: "Alimentación",
    icon: <Utensils className="h-5 w-5" />,
    color: "text-[var(--color-primary-700)]",
    subItems: [
      { id: "alimentacion-ingredientes", label: "Ingredientes" },
      { id: "alimentacion-platos", label: "Platos" },
      { id: "alimentacion-menus", label: "Menús" },
    ],
  },
  {
    id: "transporte",
    label: "Transporte",
    icon: <Bus className="h-5 w-5" />,
    color: "text-[var(--color-secondary-700)]",
    subItems: [
      { id: "transporte-vehiculos", label: "Vehículos" },
      { id: "transporte-asignaciones", label: "Asignaciones" },
    ],
  },
  {
    id: "alojamiento",
    label: "Alojamiento",
    icon: <Hotel className="h-5 w-5" />,
    color: "text-[var(--color-primary-500)]",
    subItems: [
      { id: "alojamiento-tipos", label: "Tipos" },
      { id: "alojamiento-asignaciones", label: "Asignaciones" },
    ],
  },
  {
    id: "actividades",
    label: "Actividades",
    icon: <Sparkles className="h-5 w-5" />,
    color: "text-[var(--color-secondary-500)]",
    subItems: [
      { id: "actividades-catalogo", label: "Catálogo" },
      { id: "actividades-agenda", label: "Agenda" },
    ],
  },
  {
    id: "salud",
    label: "Salud",
    icon: <Heart className="h-5 w-5" />,
    color: "text-[var(--color-negative-600)]",
    subItems: [
      { id: "salud-alergias", label: "Alergias" },
      { id: "salud-info-medica", label: "Info Médica" },
    ],
  },
  {
    id: "tareas",
    label: "Tareas",
    icon: <CheckSquare className="h-5 w-5" />,
    color: "text-[var(--color-neutral-700)]",
    subItems: [
      { id: "tareas-kanban", label: "Tablero Kanban" },
      { id: "tareas-checklist", label: "Checklists" },
    ],
  },
  {
    id: "presupuesto",
    label: "Presupuesto",
    icon: <DollarSign className="h-5 w-5" />,
    color: "text-[var(--color-primary-800)]",
    subItems: [
      { id: "presupuesto-campamentos", label: "Por Campamento" },
      { id: "presupuesto-global", label: "Vista Global" },
    ],
  },
  {
    id: "reportes",
    label: "Reportes",
    icon: <BarChart3 className="h-5 w-5" />,
    color: "text-[var(--color-secondary-800)]",
  },
  {
    id: "configuracion",
    label: "Configuración",
    icon: <Settings className="h-5 w-5" />,
    color: "text-[var(--color-neutral-500)]",
    subItems: [
      { id: "configuracion-roles", label: "Roles y Permisos" },
      { id: "configuracion-grupos", label: "Grupos y Unidades" },
      { id: "configuracion-proveedores", label: "Proveedores" },
    ],
  },
];

type SidebarProps = {
  currentModule: string;
  showColorSystem: boolean;
  onModuleChange: (moduleId: string) => void;
  onToggleColorSystem: () => void;
};

export function Sidebar({
  currentModule,
  onModuleChange,
  onToggleColorSystem,
  showColorSystem,
}: SidebarProps) {
  const [expandedModules, setExpandedModules] = React.useState<string[]>([
    "campamentos",
  ]);

  const handleModuleClick = (module: ModuleItem) => {
    const hasSubItems = Boolean(module.subItems?.length);
    if (hasSubItems) {
      setExpandedModules((previous) =>
        previous.includes(module.id)
          ? previous.filter((id) => id !== module.id)
          : [...previous, module.id],
      );
      onModuleChange(module.id);
    } else {
      onModuleChange(module.id);
    }
  };

  const isModuleActive = (module: ModuleItem) => {
    if (module.id === currentModule) {
      return true;
    }

    return module.subItems?.some((subItem) => subItem.id === currentModule);
  };

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-border bg-card/70 backdrop-blur-sm">
      <div className="border-b border-border p-6">
        <h2 className="text-lg font-semibold text-foreground">
          ERP Campamentos
        </h2>
        <p className="text-sm text-muted-foreground">
          Sistema de Gestión Scout
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-1 p-4">
          {MODULES.map((module) => {
            const active = isModuleActive(module);
            const isExpanded = expandedModules.includes(module.id);

            return (
              <div key={module.id}>
                <Button
                  variant="ghost"
                  className={cn(
                    "h-10 w-full justify-start gap-3",
                    active && "bg-accent text-accent-foreground",
                  )}
                  onClick={() => handleModuleClick(module)}
                >
                  <span className={module.color}>{module.icon}</span>
                  <span className="flex-1 text-left">{module.label}</span>
                  {module.subItems && (
                    <ChevronRight
                      className={cn(
                        "h-4 w-4 transition-transform",
                        isExpanded && "rotate-90",
                      )}
                    />
                  )}
                </Button>

                {module.subItems && isExpanded && (
                  <div className="ml-9 mt-1 space-y-1 border-l border-border/50 pl-4">
                    {module.subItems.map((subItem) => {
                      const subActive = currentModule === subItem.id;

                      return (
                        <Button
                          key={subItem.id}
                          variant="ghost"
                          className={cn(
                            "h-9 w-full justify-start text-sm",
                            subActive && "bg-accent text-accent-foreground",
                          )}
                          onClick={() => onModuleChange(subItem.id)}
                        >
                          {subItem.label}
                        </Button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <Separator />

      <div className="p-4">
        <Button
          variant="outline"
          className="w-full justify-start gap-3"
          onClick={onToggleColorSystem}
        >
          <Palette className="h-5 w-5" />
          {showColorSystem ? "Ocultar sistema de colores" : "Sistema de colores"}
        </Button>
      </div>
    </aside>
  );
}

