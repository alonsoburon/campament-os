## Migración de modelos Prisma

### Agrupaciones y roles
1. [ ] Definir estrategia de generalización para grupos (p. ej. tablas `Organization` y `OrganizationType`) manteniendo compatibilidad con `ScoutGroup`.
2. [ ] Migrar el modelo `ScoutGroup` a la nueva estructura genérica, incluyendo auditoría y relaciones.
3. [ ] Actualizar enums relacionados con grupos (`SystemRole`, `GroupRole`, `UnitRole`, `ScoutBranch`) para que se soporten desde tablas configurables.
4. [ ] Revisar y adaptar `Unit` y `UnitAssistant` a la configuración dinámica de ramas/unidades.

### Personas y usuarios
1. [ ] Migrar `Person` y su tabla pivote (`PersonGroup`) para soportar múltiples grupos y roles dinámicos.
2. [ ] Ajustar `User` y modelos de autenticación para enlazar con la nueva estructura de personas y grupos.

### Campamentos y dominio base
1. [ ] Actualizar modelos de campamentos (`Camp`, `CampParticipation`, `CampMenu`, etc.) para usar la nueva jerarquía de agrupaciones.
2. [ ] Revisar utensilios y logística (`Utensil`, `Transport`, `Accommodation`, `Activity`) alineándolos con la nueva jerarquía.

### Salud y alimentación
1. [ ] Migrar el dominio de salud (`Allergy`, `MedicalInfo`) asegurando compatibilidad con la nueva relación persona-grupo.
2. [ ] Ajustar modelos de alimentación (`Ingredient`, `Dish`, `CampMenu`, `DishIngredient`, `DishUtensil`) a la estructura generalizada.

### Costos, tareas y soporte
1. [ ] Adaptar presupuestos y costos (`Budget`, `BudgetItem`, `Provider`, `IngredientPrice`) a grupos configurables.
2. [ ] Actualizar tareas y contactos de emergencia (`Task`, `EmergencyContact`) para soportar múltiples grupos y campamentos genéricos.

### Validación final
1. [ ] Validar modelos con interacciones cruzadas para evitar regresiones (menus vs actividades, transporte vs participaciones, alojamiento vs responsabilidades, etc.).

## Principios de extensibilidad

1. [ ] Definir directrices para modelar dominios usando composición (interfaces, tablas puente y módulos reutilizables) en lugar de herencia rígida.
2. [ ] Documentar patrones de dependencia entre modelos (`Organization`, `Person`, `Camp`, etc.) para permitir combinaciones flexibles y evolución gradual.
3. [ ] Crear checklist de evaluación antes de nuevos modelos asegurando compatibilidad con composición, separación de responsabilidades y contratos explícitos.

## Desarrollo por módulos

### Línea base
1. [ ] Definir arquitectura frontend/backend/base de datos para módulos independientes pero integrados.
2. [ ] Implementar módulo de administración de grupos (creación, tipos, configuración de roles dinámicos).
3. [ ] Completar módulo de personas y usuarios (registro, invitaciones, asignación a grupos múltiples, roles).

### Operaciones de campamento
1. [ ] Desarrollar módulo de unidades y ramas (configuración dinámica, asistentes, relación con grupos).
2. [ ] Construir módulo de campamentos (planificación, participantes, cronograma).
3. [ ] Implementar módulo de salud (alergias, información médica, autorizaciones).
4. [ ] Diseñar módulo de alimentación y menús (ingredientes, platos, asignaciones a campamentos).

### Logística y seguimiento
1. [ ] Completar módulo de logística (transporte, alojamiento, utensilios).
2. [ ] Implementar módulo de actividades (programación, responsables, materiales).
3. [ ] Desarrollar módulo de presupuestos y costos (ingreso de gastos, proveedores, seguimiento).
4. [ ] Construir módulo de tareas y seguimiento (checklists, asignaciones, estados).

### Cierre
1. [ ] Integrar reportes y paneles transversales para todos los módulos.

