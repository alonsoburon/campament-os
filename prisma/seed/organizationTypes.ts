import type { PrismaClient } from "../../generated/prisma";

const DEFAULT_ORGANIZATION_TYPES = [
  {
    name: "Grupo Scout",
    description:
      "Unidad base para asociaciones scouts; organiza ramas y actividades juveniles.",
  },
  {
    name: "Distrito Scout",
    description:
      "Estructura regional que coordina varios grupos o unidades scouts.",
  },
];

export async function seedOrganizationTypes(db: PrismaClient) {
  for (const type of DEFAULT_ORGANIZATION_TYPES) {
    await db.organizationType.upsert({
      where: { name: type.name },
      update: { description: type.description },
      create: type,
    });
  }
}

