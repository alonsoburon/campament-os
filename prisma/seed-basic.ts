/**
 * Seed básico para inicializar la base de datos
 * Crea los datos mínimos necesarios para empezar a desarrollar
 */

import { PrismaClient } from "../generated/prisma/index.js";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed básico...");

  // 1. Crear rol de sistema por defecto (requerido por el schema)
  console.log("📝 Creando roles de sistema...");

  // Para roles de sistema (organization_id = null), usar findFirst + create
  let defaultRole = await prisma.role.findFirst({
    where: {
      name: "Usuario",
      organization_id: null,
    },
  });

  if (!defaultRole) {
    defaultRole = await prisma.role.create({
      data: {
        name: "Usuario",
        scope: "SYSTEM",
        description: "Rol de usuario básico del sistema",
      },
    });
  }

  let superadminRole = await prisma.role.findFirst({
    where: {
      name: "Superadmin",
      organization_id: null,
    },
  });

  if (!superadminRole) {
    superadminRole = await prisma.role.create({
      data: {
        name: "Superadmin",
        scope: "SYSTEM",
        description: "Acceso completo al sistema",
      },
    });
  }

  console.log(`✅ Roles creados: ${defaultRole.name}, ${superadminRole.name}`);

  // 2. Crear tipos de organización básicos
  console.log("📝 Creando tipos de organización...");

  const orgTypes = [
    { name: "Grupo Scout", description: "Organización scout tradicional" },
    { name: "Clan", description: "Agrupación de jóvenes mayores" },
    { name: "Distrito", description: "Agrupación de grupos scouts" },
    { name: "Asociación", description: "Organización nacional o regional" },
    { name: "Otro", description: "Otro tipo de organización" },
  ];

  for (const type of orgTypes) {
    await prisma.organizationType.upsert({
      where: { name: type.name },
      update: {},
      create: type,
    });
  }

  console.log(`✅ ${orgTypes.length} tipos de organización creados`);

  // 3. Otorgar rol admin a nuxapower@gmail.com si ya existe
  console.log("📝 Verificando usuario admin...");
  const adminUser = await prisma.user.findUnique({
    where: { email: "nuxapower@gmail.com" },
  });

  if (adminUser) {
    await prisma.user.update({
      where: { id: adminUser.id },
      data: { role: "admin" },
    });
    console.log("✅ Rol admin otorgado a nuxapower@gmail.com");
  } else {
    console.log("ℹ️  Usuario nuxapower@gmail.com aún no existe. Será admin al iniciar sesión.");
  }

  console.log("\n🎉 Seed básico completado!");
  console.log("\n📌 Próximos pasos:");
  console.log("1. Inicia sesión con Google usando nuxapower@gmail.com");
  console.log("2. Se creará automáticamente tu usuario y persona");
  console.log("3. Crea tu primera organización desde /onboarding/create-organization");
  console.log("4. ¡Empieza a desarrollar! 🚀\n");
}

main()
  .catch((e) => {
    console.error("❌ Error en el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
