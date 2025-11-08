### Mapa de Navegación ERP

- **Inicio**
  - Panel general con métricas clave: próximos campamentos, tareas críticas, pagos pendientes y alertas de salud.

- **Campamentos**
  - `Campamentos`: listado con filtros (grupo, fechas, estado) y acceso a detalle.
  - `Calendario`: vista temporal de campamentos y actividades.
  - `Campamento > Detalle`  
    - Tabs: `Resumen`, `Participantes`, `Actividades`, `Transporte`, `Alojamiento`, `Menús`, `Tareas`, `Presupuesto`.  
    - CTA cruzadas:
      - Desde `Participantes` → crear pagos, ver alergias/medicación.
      - Desde `Menús` → consultar ingredientes en Inventario.
      - Desde `Alojamiento` → asignar utensilios/equipamiento.

- **Personas**
  - `Personas`: tabla con roles (scout, líder, tutor), barra de búsqueda.
  - `Persona > Perfil`  
    - Secciones: `Datos personales`, `Roles y grupos`, `Salud`, `Campamentos`, `Tareas asignadas`.  
    - Accesos cruzados:
      - Crear/gestionar invitaciones y roles.
      - Desde `Salud` → ver alergias (link a Ingredientes) o info médica.
      - Desde `Campamentos` → ir a detalle del campamento.
      - Desde `Tareas` → ir al módulo Tareas.

- **Inventario**
  - `Utensilios`: listado por categoría/estado.
  - `Equipamiento`: similar pero para activos no culinarios.
  - Detalle de utensilio/equipo → ver disponibilidad por campamento y mantenimiento.
  - Enlaces: desde Campamentos y Menús para verificar stock, desde tareas para reservar recursos.

- **Alimentación**
  - `Ingredientes`: catálogo con alérgenos, proveedores y costos (integra Inventario).
  - `Platos`: recetas, tiempos, alergias asociadas.
  - `Menús por campamento` → navegación directa a la pestaña de campamento relevante.
  - Cross links: desde alergias personales, desde presupuesto (costo de platos), desde inventario (utensilios requeridos).

- **Transporte**
  - `Vehículos y proveedores`: listado con capacidad, choferes, costos.
  - `Asignaciones`: por campamento, con rutas y participantes.
  - Enlaces: desde Campamentos > Transporte, desde Presupuesto, desde Tareas (logística).

- **Alojamiento**
  - `Tipos de alojamiento`: capacidad, estado, responsables.
  - `Asignaciones`: personas por campamento, check-in/out.
  - Cross links: desde Campamentos, Tareas, Inventario (equipamiento en cuartos).

- **Actividades**
  - `Catálogo`: lista de actividades reutilizables con requerimientos.
  - `Agenda por campamento`: editable en timeline, asigna responsables y materiales.
  - Ligado a Tareas, Inventario (materiales), Personas (responsables), Menús (cuando hay comidas asociadas).

- **Salud**
  - `Alergias`: vista consolidada por persona y alimentos relacionados.
  - `Información médica`: condiciones, medicación, contactos.
  - Alertas integradas en Campamentos (participantes con riesgos) y Alimentación (ingredientes sensibles).

- **Tareas y Checklists**
  - `Tablero Kanban`: PENDIENTE / EN PROGRESO / COMPLETADA / CANCELADA, asignación a personas.
  - `Tareas por campamento`: filtrado rápido, dependencia con Transporte, Alojamiento, Inventario.
  - Enlaces: crear tarea desde cualquier vista contextual (campamento, actividad, presupuesto, etc.).
  - Checklists vinculadas a preparativos (logística, compras).

- **Presupuesto**
  - `Presupuestos por campamento`: gastos plan vs real.
  - `Items`: alimentos, transporte, alojamiento, otros; asociación con proveedores e ingredientes.
  - Enlaces: desde Ingredientes (costos), Transporte, Alojamiento, Tareas (gastos operativos).

- **Reportes**
  - Health dashboard (alergias, medicación pendientes).
  - Financiero (gasto por campamento/proveedor).
  - Logístico (ocupación de alojamientos, uso de transporte).

- **Configuración**
  - `Roles y permisos` (SystemRole, GroupRole, UnitRole).
  - `Grupos y unidades`.
  - `Invitaciones` y `Tokens de verificación`.
  - Integración con proveedores y parámetros globales.

### Recomendaciones para Figma

- **Estructura macro**: barra lateral izquierda con los módulos principales; submenús desplegables para navegar entre vistas (ej. Campamentos > Detalle).
- **Encabezado persistente**: breadcrumbs que muestren la jerarquía (Campamentos / Campamento Alpha / Participantes).
- **Espacios de cross-navigation**: en cada detalle, una sección lateral (panel derecho) con enlaces contextuales (“Ver alergias”, “Abrir presupuesto”, etc.).
- **Componentes reutilizables**: tarjetas para campamentos, tablas con acciones, timeline de actividades, kanban de tareas, formularios para CRUD.
- **Estados vacíos y alertas**: indica visualmente cuando falta información crítica (pagos no realizados, documentación pendiente, stock bajo).
- **Sistema de colores**: asignar énfasis por dominio (ej. azul logística, verde finanzas, rojo salud) para identificar rápidamente las secciones relacionadas.

Con este mapa puedes arrancar en Figma armando un “Sitemap” y luego componiendo wireframes por flujo (ej. creación de campamento, gestión de menú, asignación de transporte).