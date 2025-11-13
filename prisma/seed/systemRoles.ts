import type { PrismaClient } from "../../generated/prisma";

const SYSTEM_ROLES = [
  {
    name: "Superadmin",
    description: "Acceso completo al sistema para personal interno de CampamentOS.",
  },
  {
    name: "Administrador Global",
    description: "Acceso administrativo general fuera del ámbito de una organización específica.",
  },
  {
    name: "Usuario Estándar",
    description: "Acceso básico para miembros autenticados del sistema.",
  },
];

export async function seedSystemRoles(db: PrismaClient) {
  for (const role of SYSTEM_ROLES) {
    const existing = await db.role.findFirst({
      where: {
        name: role.name,
        organization_id: null,
      },
    });

    if (existing) {
      await db.role.update({
        where: { id: existing.id },
        data: {
          description: role.description,
          scope: "SYSTEM",
        },
      });
    } else {
      await db.role.create({
        data: {
          name: role.name,
          description: role.description,
          scope: "SYSTEM",
        },
      });
    }
  }
}
