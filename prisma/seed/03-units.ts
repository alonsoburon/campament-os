import { PrismaClient } from "../../generated/prisma/index.js";
import { faker } from "@faker-js/faker";
import {
  ensureCreateIfNotExists,
  ensureCompositeUpsert,
} from "./helpers.js";

const DEFAULT_BRANCHES = [
  "Manada / Lobatos",
  "Tropa Scout",
  "Caminantes / Raiders",
  "Clan Rover",
  "Kraal / Dirección",
];

const DEFAULT_ROLES = [
  { name: "Administrador", description: "Acceso completo para configurar la organización." },
  { name: "Coordinador", description: "Gestiona equipos, actividades y recursos clave." },
  { name: "Líder", description: "Coordina actividades y seguimiento de participantes." },
  { name: "Colaborador", description: "Apoya tareas específicas y logística." },
  { name: "Invitado", description: "Acceso limitado a información compartida." },
];

// Batch-oriented and reduced round-trips version
export async function seedUnits(prisma: PrismaClient) {
  const organizations = await prisma.organization.findMany();
  const persons = await prisma.person.findMany();

  for (const org of organizations) {
    // 1) Branches: create missing branches in a single createMany
    const desiredBranchNames = DEFAULT_BRANCHES.map((b) => `${org.name} - ${b}`);
    const existingBranches = await prisma.branch.findMany({
      where: { organization_id: org.id },
      select: { id: true, name: true },
    });
    const existingBranchNames = new Set(existingBranches.map((b) => b.name));
    const toCreateBranches = desiredBranchNames
      .filter((n) => !existingBranchNames.has(n))
      .map((name) => ({ name, organization_id: org.id }));

    if (toCreateBranches.length > 0) {
      await prisma.branch.createMany({ data: toCreateBranches });
    }

    // 2) Roles: create missing organization-scoped roles in batch
    const desiredRoleNames = DEFAULT_ROLES.map((r) => r.name);
    const existingRoles = await prisma.role.findMany({ where: { organization_id: org.id } });
    const existingRoleNames = new Set(existingRoles.map((r) => r.name));
    const rolesToCreate = DEFAULT_ROLES.filter((r) => !existingRoleNames.has(r.name)).map((r) => ({
      name: r.name,
      scope: "ORGANIZATION",
      description: r.description,
      organization_id: org.id,
    }));

    if (rolesToCreate.length > 0) {
      await prisma.role.createMany({ data: rolesToCreate as any });
    }

    // Refresh roles reference
    const roles = await prisma.role.findMany({ where: { organization_id: org.id } });

    // 3) Organization members: assign first N persons to roles (batch createMany skipDuplicates)
    const assignCount = Math.min(persons.length, 5);
    const orgMemberData = [] as any[];
    for (let i = 0; i < assignCount; i++) {
      const person = persons[i]!;
      const role = roles[i % roles.length]!;
      orgMemberData.push({ person_id: person.id, organization_id: org.id, role_id: role.id });
    }
    if (orgMemberData.length > 0) {
      await prisma.organizationMember.createMany({ data: orgMemberData, skipDuplicates: true });
    }

    // 4) Units per branch: create in batch per organization
    const branches = await prisma.branch.findMany({ where: { organization_id: org.id } });
    const desiredUnits = [] as { name: string; organization_id: number; branch_id: number }[];
    for (const branch of branches) {
      for (let i = 0; i < 2; i++) {
        const unitName = `${branch.name} - Unit ${i + 1}`;
        desiredUnits.push({ name: unitName, organization_id: org.id, branch_id: branch.id });
      }
    }

    // Find existing units names for this org to avoid duplicates
    const existingUnits = await prisma.unit.findMany({ where: { organization_id: org.id }, select: { name: true } });
    const existingUnitNames = new Set(existingUnits.map((u) => u.name));
    const unitsToCreate = desiredUnits.filter((u) => !existingUnitNames.has(u.name));

    if (unitsToCreate.length > 0) {
      await prisma.unit.createMany({ data: unitsToCreate });
    }

    // 5) Unit assistants: assign first 3 persons to each unit (batch createMany skipDuplicates)
    const updatedUnits = await prisma.unit.findMany({ where: { organization_id: org.id } });
    const unitAssistantsData: any[] = [];
    for (const unit of updatedUnits) {
      const assistants = persons.slice(0, 3);
      for (const assistant of assistants) {
        const leaderRole = roles.find((r) => r.name === "Líder") || roles[0]!;
        unitAssistantsData.push({ unit_id: unit.id, assistant_id: assistant.id, role_id: leaderRole.id });
      }
    }
    if (unitAssistantsData.length > 0) {
      await prisma.unitAssistant.createMany({ data: unitAssistantsData, skipDuplicates: true });
    }
  }
}