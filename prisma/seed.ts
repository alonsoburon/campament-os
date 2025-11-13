import { PrismaClient } from "../generated/prisma";
import { seedOrganizationTypes } from "./seed/organizationTypes";
import { seedSystemRoles } from "./seed/systemRoles";
import { seedDemoData } from "./seed/demoData";

async function main() {
  const db = new PrismaClient();

  try {
    await seedOrganizationTypes(db);
    await seedSystemRoles(db);
    await seedDemoData(db);
  } finally {
    await db.$disconnect();
  }
}

void main();

