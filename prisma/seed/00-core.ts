import { PrismaClient } from "../../generated/prisma/index.js";
import { ensureUpsert } from "./helpers.js";

export async function seedCore(prisma: PrismaClient) {
  // System roles
  const systemRoles = [
    { name: "Usuario", description: "Rol de usuario básico del sistema" },
    { name: "Superadmin", description: "Acceso completo al sistema" },
  ];

  for (const role of systemRoles) {
    const existing = await prisma.role.findFirst({
      where: { name: role.name, organization_id: null },
    });
    if (!existing) {
      await prisma.role.create({
        data: { ...role, scope: "SYSTEM", organization_id: null },
      });
    }
  }

  // Organization types
  const orgTypes = [
    { name: "Grupo Scout", description: "Organización scout tradicional" },
    { name: "Clan", description: "Agrupación de jóvenes mayores" },
    { name: "Distrito", description: "Agrupación de grupos scouts" },
    { name: "Asociación", description: "Organización nacional o regional" },
    { name: "Otro", description: "Otro tipo de organización" },
  ];

  for (const type of orgTypes) {
    await ensureUpsert(prisma, prisma.organizationType, { name: type.name }, type);
  }
}