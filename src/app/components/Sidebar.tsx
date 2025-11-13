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
  Package,
  Settings,
  Sparkles,
  Users,
  Utensils,
} from "lucide-react";

import { cn } from "./ui/utils";
import { Logo } from "./Logo";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Skeleton } from "./ui/skeleton";

interface ModuleSubItem {
  id: string;
  label: string;
  icon: React.ReactElement;
}

interface ModuleItem {
  id: string;
  label: string;
  icon: React.ReactElement;
  subItems?: ModuleSubItem[];
}

interface ModuleSection {
  title: string;
  modules: ModuleItem[];
}

const MODULE_SECTIONS: ModuleSection[] = [
  {
    title: "General",
    modules: [
      { id: "inicio", label: "Inicio", icon: <Home className="h-4 w-4" /> },
      {
        id: "campamentos",
        label: "Campamentos",
        icon: <Calendar className="h-4 w-4" />,
      },
      { id: "personas", label: "Personas", icon: <Users className="h-4 w-4" /> },
    ],
  },
  {
    title: "Recursos",
    modules: [
      { id: "inventario", label: "Inventario", icon: <Package className="h-4 w-4" /> },
      {
        id: "alimentacion",
        label: "Alimentación",
        icon: <Utensils className="h-4 w-4" />,
      },
      { id: "transporte", label: "Transporte", icon: <Bus className="h-4 w-4" /> },
      { id: "alojamiento", label: "Alojamiento", icon: <Hotel className="h-4 w-4" /> },
    ],
  },
  {
    title: "Gestión",
    modules: [
      {
        id: "actividades",
        label: "Actividades",
        icon: <Sparkles className="h-4 w-4" />,
      },
      { id: "salud", label: "Salud", icon: <Heart className="h-4 w-4" /> },
      { id: "tareas", label: "Tareas", icon: <CheckSquare className="h-4 w-4" /> },
      {
        id: "presupuesto",
        label: "Presupuesto",
        icon: <DollarSign className="h-4 w-4" />,
      },
    ],
  },
  {
    title: "Análisis",
    modules: [
      { id: "reportes", label: "Reportes", icon: <BarChart3 className="h-4 w-4" /> },
    ],
  },
];

const ALL_MODULE_IDS = MODULE_SECTIONS.flatMap((section) =>
  section.modules.map((module) => module.id),
).concat("configuracion");

type SidebarProps = {
  currentModule: string;
  showColorSystem: boolean;
  onModuleChange: (moduleId: string) => void;
  onToggleColorSystem: () => void;
  allowedModules?: string[];
  isLoading?: boolean;
};

export function Sidebar({
  currentModule,
  onModuleChange,
  onToggleColorSystem: _onToggleColorSystem,
  showColorSystem: _showColorSystem,
  allowedModules,
  isLoading = false,
}: SidebarProps) {
  const [expandedModules, setExpandedModules] = React.useState<string[]>([]);
  const navRef = React.useRef<HTMLDivElement>(null);
  const [indicatorPosition, setIndicatorPosition] = React.useState({
    top: 0,
    opacity: 0,
  });
  const INDICATOR_HEIGHT = 20;

  const allowedModuleSet = React.useMemo(() => {
    const ids =
      allowedModules && allowedModules.length > 0
        ? allowedModules
        : ALL_MODULE_IDS;
    return new Set(ids);
  }, [allowedModules]);

  const visibleSections = React.useMemo(() => {
    return MODULE_SECTIONS.map((section) => ({
      ...section,
      modules: section.modules.filter((module) =>
        allowedModuleSet.has(module.id),
      ),
    })).filter((section) => section.modules.length > 0);
  }, [allowedModuleSet]);

  const handleModuleClick = React.useCallback(
    (module: ModuleItem) => {
      if (!allowedModuleSet.has(module.id)) {
        return;
      }

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
    },
    [allowedModuleSet, onModuleChange],
  );

  const isModuleActive = React.useCallback(
    (module: ModuleItem) => {
      if (!allowedModuleSet.has(module.id)) {
        return false;
      }

      if (module.id === currentModule) {
        return true;
      }

      return module.subItems?.some((subItem) => subItem.id === currentModule);
    },
    [allowedModuleSet, currentModule],
  );

  React.useEffect(() => {
    const navElement = navRef.current;
    if (!navElement) {
      return;
    }

    const activeButton = navElement.querySelector<HTMLButtonElement>(
      'button[data-active-module="true"]',
    );

    if (!activeButton) {
      setIndicatorPosition((previous) => ({
        ...previous,
        opacity: 0,
      }));
      return;
    }

    const navRect = navElement.getBoundingClientRect();
    const buttonRect = activeButton.getBoundingClientRect();
    const top =
      buttonRect.top -
      navRect.top +
      buttonRect.height / 2 -
      INDICATOR_HEIGHT / 2;

    setIndicatorPosition({
      top,
      opacity: 1,
    });
  }, [currentModule, expandedModules]);

  const configurationEnabled =
    allowedModuleSet.has("configuracion") && !isLoading;

  return (
    <div className="flex h-full flex-col px-4 py-6">
      {/* Logo y branding */}
      <div className="mb-8 flex flex-col items-center space-y-3 text-center">
        <Logo className="[--logo-campamentos-width:11.5rem]" />
        <p className="text-[11px] font-medium leading-snug text-muted-foreground">
          Plataforma integral para campamentos, expediciones y aventuras épicas.
        </p>
      </div>

      {/* Navegación principal */}
      <ScrollArea className="flex-1 -mx-4 px-4">
        <nav
          ref={navRef}
          className="relative space-y-6 pb-4 animate-slide-in"
        >
          <span
            className="pointer-events-none absolute left-0 top-0 z-10 w-1 rounded-r-full transition-all duration-300 ease-out"
            style={{
              backgroundColor: "var(--sidebar-indicator)",
              height: INDICATOR_HEIGHT,
              transform: `translateY(${indicatorPosition.top}px)`,
              opacity: indicatorPosition.opacity,
            }}
          />

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((index) => (
                <div key={index} className="space-y-2">
                  <Skeleton className="h-3 w-20 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-9 w-full rounded-lg" />
                    <Skeleton className="h-9 w-5/6 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            visibleSections.map((section) => (
              <div key={section.title} className="space-y-1.5">
                <h2 className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                  {section.title}
                </h2>
                <div className="space-y-0.5">
                  {section.modules.map((module) => {
                    const active = isModuleActive(module);
                    const expanded = expandedModules.includes(module.id);

                    return (
                      <div key={module.id} className="animate-fade-in">
                        <Button
                          variant="ghost"
                          className={cn(
                            "relative h-10 w-full justify-start gap-3 rounded-lg px-3 text-[13px] font-medium transition-all duration-200 ease-out",
                            active
                              ? "bg-foreground/5 text-foreground shadow-s hover:bg-foreground/5 hover:text-foreground focus-visible:bg-foreground/5 focus-visible:text-foreground dark:bg-foreground/10 dark:hover:bg-foreground/10 dark:focus-visible:bg-foreground/10"
                              : "group text-muted-foreground hover:-translate-x-0.5 hover:bg-accent/80 hover:text-foreground hover:shadow-s",
                          )}
                          data-active-module={active ? "true" : undefined}
                          onClick={() => handleModuleClick(module)}
                          data-active={active ? "true" : "false"}
                          aria-current={active ? "page" : undefined}
                        >
                          <span
                            className={cn(
                              "flex h-5 w-5 items-center justify-center rounded-md transition-all duration-200",
                              active
                                ? "text-foreground"
                                : "text-muted-foreground group-hover:scale-110 group-hover:text-foreground",
                            )}
                          >
                            {module.icon}
                          </span>
                          <span className="flex-1 text-left">{module.label}</span>
                          {module.subItems ? (
                            <ChevronRight
                              className={cn(
                                "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
                                expanded && "rotate-90 text-foreground",
                              )}
                            />
                          ) : null}
                        </Button>

                        {module.subItems && expanded ? (
                          <div className="ml-8 mt-1 space-y-0.5 animate-sidebar-expand">
                            {module.subItems.map((subItem, subIndex) => {
                              const subActive = currentModule === subItem.id;

                              return (
                                <Button
                                  key={subItem.id}
                                  variant="ghost"
                                  className={cn(
                                    "h-8 w-full justify-start gap-2 rounded-md px-2 text-[13px] transition-all duration-200 animate-sidebar-item",
                                    subActive
                                      ? "bg-accent text-foreground shadow-s"
                                      : "group/sub text-muted-foreground hover:-translate-x-0.5 hover:bg-accent/80 hover:text-foreground hover:shadow-s",
                                  )}
                                  style={{ animationDelay: `${subIndex * 60}ms` }}
                                  onClick={() => onModuleChange(subItem.id)}
                                  data-active={subActive ? "true" : "false"}
                                >
                                  <span
                                    className={cn(
                                      "flex h-1.5 w-1.5 items-center justify-center rounded-full transition-all duration-200",
                                      subActive
                                        ? "scale-110 bg-(--sidebar-indicator)"
                                        : "group-hover/sub:scale-110 group-hover/sub:bg-foreground/60",
                                    )}
                                  />
                                  <span>{subItem.label}</span>
                                </Button>
                              );
                            })}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}

          {configurationEnabled ? (
            <div className="space-y-1.5 border-t border-border/50 pt-2">
              <Button
                variant="ghost"
                className={cn(
                  "relative h-10 w-full justify-start gap-3 rounded-lg px-3 text-[13px] font-medium transition-all duration-200 ease-out",
                  currentModule === "configuracion"
                    ? "bg-foreground/5 text-foreground shadow-s hover:bg-foreground/5 hover:text-foreground focus-visible:bg-foreground/5 focus-visible:text-foreground dark:bg-foreground/10 dark:hover:bg-foreground/10 dark:focus-visible:bg-foreground/10"
                    : "group text-muted-foreground hover:-translate-x-0.5 hover:bg-accent/80 hover:text-foreground hover:shadow-s",
                )}
                onClick={() => onModuleChange("configuracion")}
                data-active-module={
                  currentModule === "configuracion" ? "true" : undefined
                }
                data-active={currentModule === "configuracion" ? "true" : "false"}
                aria-current={currentModule === "configuracion" ? "page" : undefined}
              >
                <span
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-md transition-all duration-200",
                    currentModule === "configuracion"
                      ? "text-foreground"
                      : "text-muted-foreground group-hover:scale-110 group-hover:text-foreground",
                  )}
                >
                  <Settings className="h-4 w-4" />
                </span>
                <span className="flex-1 text-left">Configuración</span>
              </Button>
            </div>
          ) : null}
        </nav>
      </ScrollArea>
    </div>
  );
}
