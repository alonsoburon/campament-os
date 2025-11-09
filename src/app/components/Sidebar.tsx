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

type ModuleSubItem = {
  id: string;
  label: string;
};

type ModuleItem = {
  id: string;
  label: string;
  icon: React.ReactElement;
  subItems?: ModuleSubItem[];
};

const MODULES: ModuleItem[] = [
  {
    id: "inicio",
    label: "Inicio",
    icon: <Home className="h-5 w-5" />,
  },
  {
    id: "campamentos",
    label: "Campamentos",
    icon: <Calendar className="h-5 w-5" />,
    subItems: [
      { id: "campamentos-lista", label: "Listado" },
      { id: "campamentos-calendario", label: "Calendario" },
    ],
  },
  {
    id: "personas",
    label: "Personas",
    icon: <Users className="h-5 w-5" />,
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
    subItems: [
      { id: "inventario-utensilios", label: "Utensilios" },
      { id: "inventario-equipamiento", label: "Equipamiento" },
    ],
  },
  {
    id: "alimentacion",
    label: "Alimentación",
    icon: <Utensils className="h-5 w-5" />,
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
    subItems: [
      { id: "transporte-vehiculos", label: "Vehículos" },
      { id: "transporte-asignaciones", label: "Asignaciones" },
    ],
  },
  {
    id: "alojamiento",
    label: "Alojamiento",
    icon: <Hotel className="h-5 w-5" />,
    subItems: [
      { id: "alojamiento-tipos", label: "Tipos" },
      { id: "alojamiento-asignaciones", label: "Asignaciones" },
    ],
  },
  {
    id: "actividades",
    label: "Actividades",
    icon: <Sparkles className="h-5 w-5" />,
    subItems: [
      { id: "actividades-catalogo", label: "Catálogo" },
      { id: "actividades-agenda", label: "Agenda" },
    ],
  },
  {
    id: "salud",
    label: "Salud",
    icon: <Heart className="h-5 w-5" />,
    subItems: [
      { id: "salud-alergias", label: "Alergias" },
      { id: "salud-info-medica", label: "Info Médica" },
    ],
  },
  {
    id: "tareas",
    label: "Tareas",
    icon: <CheckSquare className="h-5 w-5" />,
    subItems: [
      { id: "tareas-kanban", label: "Tablero Kanban" },
      { id: "tareas-checklist", label: "Checklists" },
    ],
  },
  {
    id: "presupuesto",
    label: "Presupuesto",
    icon: <DollarSign className="h-5 w-5" />,
    subItems: [
      { id: "presupuesto-campamentos", label: "Por Campamento" },
      { id: "presupuesto-global", label: "Vista Global" },
    ],
  },
  {
    id: "reportes",
    label: "Reportes",
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    id: "configuracion",
    label: "Configuración",
    icon: <Settings className="h-5 w-5" />,
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
  const [expandedModules, setExpandedModules] = React.useState<string[]>([]);

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
    <div className="flex h-full flex-col gap-8 px-6 py-8">
      <div className="space-y-1">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--surface-active) font-semibold text-(--text-primary)">
          C
        </div>
        <p className="text-sm font-semibold text-(--text-primary)">CapamentOS</p>
        <p className="text-xs text-(--text-secondary)">Sistema de Gestión Scout</p>
      </div>

      <ScrollArea className="flex-1 pr-2">
        <div className="space-y-1">
          {MODULES.map((module) => {
            const active = isModuleActive(module);
            const expanded = expandedModules.includes(module.id);

            return (
              <div key={module.id} className="space-y-1">
                <Button
                  variant="ghost"
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-(--text-secondary) hover:bg-(--surface-hover) hover:text-(--text-primary)",
                    active && "bg-(--surface-active) text-(--text-primary) font-semibold",
                  )}
                  onClick={() => handleModuleClick(module)}
                >
                  {module.icon}
                  <span className="flex-1 text-left">{module.label}</span>
                  {module.subItems ? (
                    <ChevronRight
                      className={cn("h-4 w-4 transition-transform", expanded && "rotate-90")}
                    />
                  ) : null}
                </Button>

                {module.subItems && expanded ? (
                  <div className="ml-6 space-y-1">
                    {module.subItems.map((subItem) => {
                      const subActive = currentModule === subItem.id;

                      return (
                        <Button
                          key={subItem.id}
                          variant="ghost"
                          className={cn(
                            "w-full justify-start rounded-lg px-3 py-2 text-sm text-(--text-secondary) hover:bg-(--surface-hover) hover:text-(--text-primary)",
                            subActive && "bg-(--surface-active) text-(--text-primary)",
                          )}
                          onClick={() => onModuleChange(subItem.id)}
                        >
                          {subItem.label}
                        </Button>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <Button
        variant="outline"
        className="flex items-center gap-2 rounded-lg border-transparent bg-transparent text-(--text-secondary) hover:bg-(--surface-hover) hover:text-(--text-primary)"
        onClick={onToggleColorSystem}
      >
        <Palette className="h-5 w-5" />
        {showColorSystem ? "Ocultar sistema de colores" : "Mostrar sistema de colores"}
      </Button>
    </div>
  );
}
