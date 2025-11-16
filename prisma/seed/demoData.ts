import type { PrismaClient } from "../../generated/prisma";

const DEMO_ORG_NAME = "Grupo Scout Aurora";
const DEMO_BRANCHES = [
  "Manada / Lobatos",
  "Tropa Scout",
  "Clan Rover",
];

const ORG_ROLE_DEFINITIONS = [
  {
    name: "Administrador",
    description: "Gestiona la organización y todos sus módulos.",
  },
  {
    name: "Coordinador",
    description: "Supervisa campamentos, logística y equipo.",
  },
  {
    name: "Líder",
    description: "Coordina actividades y acompaña a los participantes.",
  },
  {
    name: "Colaborador",
    description: "Apoya tareas operativas específicas.",
  },
  {
    name: "Invitado",
    description: "Acceso de solo lectura a secciones limitadas.",
  },
];

const SYSTEM_ROLE_NAMES = {
  superadmin: "Superadmin",
  standard: "Usuario Estándar",
} as const;

export async function seedDemoData(db: PrismaClient) {
  const [superadminRole, standardRole] = await Promise.all([
    db.role.findUnique({
      where: {
        name_organization_id: {
          name: SYSTEM_ROLE_NAMES.superadmin,
          organization_id: null,
        },
      },
    }),
    db.role.findUnique({
      where: {
        name_organization_id: {
          name: SYSTEM_ROLE_NAMES.standard,
          organization_id: null,
        },
      },
    }),
  ]);

  if (!superadminRole || !standardRole) {
    throw new Error(
      "Los roles de sistema no están definidos. Ejecuta seedSystemRoles antes de seedDemoData.",
    );
  }

  const organizationType = await db.organizationType.findFirst({
    where: { name: "Grupo Scout" },
  });

  if (!organizationType) {
    throw new Error(
      "No se encontró el tipo de organización 'Grupo Scout'. Asegúrate de ejecutar seedOrganizationTypes primero.",
    );
  }

  const adminUser = await db.user.upsert({
    where: { email: "admin@campamentos.demo" },
    update: {
      name: "Alex Admin",
      system_role: {
        connect: { id: superadminRole.id },
      },
      person: {
        update: {
          full_name: "Alex Admin",
          phone: "+34 600 000 001",
        },
      },
    },
    create: {
      email: "admin@campamentos.demo",
      emailVerified: new Date(),
      name: "Alex Admin",
      system_role: {
        connect: { id: superadminRole.id },
      },
      person: {
        create: {
          full_name: "Alex Admin",
          phone: "+34 600 000 001",
        },
      },
    },
    include: { person: true },
  });

  const leaderUser = await db.user.upsert({
    where: { email: "lider@campamentos.demo" },
    update: {
      name: "Lucía Líder",
      system_role: {
        connect: { id: standardRole.id },
      },
      person: {
        update: {
          full_name: "Lucía Líder",
          phone: "+34 600 000 002",
        },
      },
    },
    create: {
      email: "lider@campamentos.demo",
      emailVerified: new Date(),
      name: "Lucía Líder",
      system_role: {
        connect: { id: standardRole.id },
      },
      person: {
        create: {
          full_name: "Lucía Líder",
          phone: "+34 600 000 002",
        },
      },
    },
    include: { person: true },
  });

  const guardianUser = await db.user.upsert({
    where: { email: "colaborador@campamentos.demo" },
    update: {
      name: "Carlos Colaborador",
      system_role: {
        connect: { id: standardRole.id },
      },
      person: {
        update: {
          full_name: "Carlos Colaborador",
          phone: "+34 600 000 003",
        },
      },
    },
    create: {
      email: "colaborador@campamentos.demo",
      emailVerified: new Date(),
      name: "Carlos Colaborador",
      system_role: {
        connect: { id: standardRole.id },
      },
      person: {
        create: {
          full_name: "Carlos Colaborador",
          phone: "+34 600 000 003",
        },
      },
    },
    include: { person: true },
  });

  const organization = await db.organization.upsert({
    where: { name: DEMO_ORG_NAME },
    update: {
      address: "Calle Bosque 123, Madrid",
      phone: "+34 910 555 123",
      group_email: "contacto@aurora-scouts.org",
      is_mixed: true,
      updater_id: adminUser.person_id,
      type_id: organizationType.id,
    },
    create: {
      name: DEMO_ORG_NAME,
      type_id: organizationType.id,
      district: "Madrid Norte",
      zone: "Zona 5",
      number: 123,
      is_mixed: true,
      address: "Calle Bosque 123, Madrid",
      phone: "+34 910 555 123",
      group_email: "contacto@aurora-scouts.org",
      creator_id: adminUser.person_id,
      updater_id: adminUser.person_id,
    },
  });

  await db.organizationMember.deleteMany({
    where: { organization_id: organization.id },
  });

  await db.branch.deleteMany({ where: { organization_id: organization.id } });
  await db.branch.createMany({
    data: DEMO_BRANCHES.map((name) => ({
      name,
      organization_id: organization.id,
    })),
    skipDuplicates: true,
  });

  const roleMap = new Map<string, number>();
  for (const roleDefinition of ORG_ROLE_DEFINITIONS) {
    const role = await db.role.upsert({
      where: {
        name_organization_id: {
          name: roleDefinition.name,
          organization_id: organization.id,
        },
      },
      update: {
        description: roleDefinition.description,
        scope: "ORGANIZATION",
      },
      create: {
        name: roleDefinition.name,
        description: roleDefinition.description,
        scope: "ORGANIZATION",
        organization_id: organization.id,
      },
    });
    roleMap.set(roleDefinition.name, role.id);
  }

  await db.organizationMember.createMany({
    data: [
      {
        person_id: adminUser.person_id,
        organization_id: organization.id,
        role_id: roleMap.get("Administrador")!,
      },
      {
        person_id: leaderUser.person_id,
        organization_id: organization.id,
        role_id: roleMap.get("Líder")!,
      },
      {
        person_id: guardianUser.person_id,
        organization_id: organization.id,
        role_id: roleMap.get("Colaborador")!,
      },
    ],
    skipDuplicates: true,
  });

  await db.task.deleteMany({ where: { camp: { organization_id: organization.id } } });
  await db.campParticipation.deleteMany({ where: { camp: { organization_id: organization.id } } });
  await db.transport.deleteMany({ where: { camp: { organization_id: organization.id } } });
  await db.accommodation.deleteMany({ where: { camp: { organization_id: organization.id } } });
  await db.budget.deleteMany({ where: { camp: { organization_id: organization.id } } });
  await db.camp.deleteMany({ where: { organization_id: organization.id } });

  const upcomingCamp = await db.camp.create({
    data: {
      name: "Campamento Primavera 2025",
      location: "Sierra de Guadarrama",
      start_date: new Date(Date.UTC(2025, 3, 18)),
      end_date: new Date(Date.UTC(2025, 3, 21)),
      organization_id: organization.id,
      fee_cost: 150,
      creator_id: adminUser.person_id,
      updater_id: adminUser.person_id,
    },
  });

  await db.campParticipation.createMany({
    data: [
      {
        camp_id: upcomingCamp.id,
        person_id: leaderUser.person_id,
        payment_made: true,
      },
      {
        camp_id: upcomingCamp.id,
        person_id: guardianUser.person_id,
        payment_made: false,
      },
    ],
    skipDuplicates: true,
  });

  await db.task.createMany({
    data: [
      {
        camp_id: upcomingCamp.id,
        title: "Confirmar transporte",
        description: "Coordinar autobuses para 45 participantes.",
        status: "IN_PROGRESS",
        priority: "HIGH",
        due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        assigned_to_person_id: guardianUser.person_id,
      },
      {
        camp_id: upcomingCamp.id,
        title: "Revisar alergias participantes",
        description: "Verificar fichas médicas actualizadas.",
        status: "PENDING",
        priority: "URGENT",
        due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        assigned_to_person_id: leaderUser.person_id,
      },
      {
        camp_id: upcomingCamp.id,
        title: "Planificar menús campamento",
        description: "Definir menús adaptados a intolerancias.",
        status: "PENDING",
        priority: "MEDIUM",
        due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        assigned_to_person_id: guardianUser.person_id,
      },
    ],
  });

  await db.budget.create({
    data: {
      camp_id: upcomingCamp.id,
      name: "Presupuesto Primavera",
      estimated_food_cost: 1200,
      estimated_transport_cost: 900,
      estimated_accommodation_cost: 600,
      estimated_other_cost: 400,
      estimated_total: 3100,
      actual_total: 0,
      creator_id: adminUser.person_id,
      updater_id: adminUser.person_id,
    },
  });

  await db.ingredient.deleteMany({ where: { organization_id: organization.id } });
  await db.utensil.deleteMany({ where: { organization_id: organization.id } });
  await db.ingredient.createMany({
    data: [
      {
        name: "Arroz",
        organization_id: organization.id,
        unit_of_measure: "kg",
        description: "Arroz blanco de grano largo",
      },
      {
        name: "Pasta",
        organization_id: organization.id,
        unit_of_measure: "kg",
        description: "Pasta integral",
      },
    ],
    skipDuplicates: true,
  });

  await db.utensil.createMany({
    data: [
      {
        name: "Ollas grandes",
        category: "KITCHEN",
        organization_id: organization.id,
        available_quantity: 6,
        status: "GOOD",
      },
      {
        name: "Carpas familiares",
        category: "CAMPING",
        organization_id: organization.id,
        available_quantity: 10,
        status: "GOOD",
      },
    ],
    skipDuplicates: true,
  });

  await db.transport.createMany({
    data: [
      {
        camp_id: upcomingCamp.id,
        type: "BUS",
        name: "Autobús Principal",
        passenger_capacity: 50,
        driver_name: "Transportes Roble",
        driver_phone: "+34 911 222 333",
      },
    ],
  });

  await db.accommodation.createMany({
    data: [
      {
        camp_id: upcomingCamp.id,
        type: "TENT",
        name: "Zona de tiendas",
        capacity: 40,
        description: "Área de tiendas familiares",
      },
      {
        camp_id: upcomingCamp.id,
        type: "CABIN",
        name: "Cabañas de líderes",
        capacity: 10,
        description: "Alojamiento para el staff",
      },
    ],
  });

  await db.allergy.deleteMany({
    where: {
      person_id: leaderUser.person_id,
    },
  });

  await db.allergy.create({
    data: {
      person_id: leaderUser.person_id,
      name: "Alergia a frutos secos",
      severity: "SEVERE",
      observations: "Llevar siempre autoinyector disponible.",
      creator_id: adminUser.person_id,
      updater_id: adminUser.person_id,
    },
  });
}
