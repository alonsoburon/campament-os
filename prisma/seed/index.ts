import { PrismaClient } from "../../generated/prisma/index.js";
import { seedCore } from "./00-core";
import { seedOrganizations } from "./01-organizations";
import { seedPeopleUsers } from "./02-people-users";
import { seedUnits } from "./03-units";
import { seedCamps } from "./04-camps";
import { seedFood } from "./05-food";
import { seedUtensils } from "./06-utensils";
import { seedProvidersPrices } from "./07-providers-prices";
import { seedTransportAccommodation } from "./08-transport-accommodation";
import { seedActivities } from "./09-activities";
import { seedBudget } from "./10-budget";
import { seedTasksEmergency } from "./11-tasks-emergency";
import { seedDemodata } from "./12-demodata";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting full seed...");

  try {
    await seedCore(prisma);
    console.log("✅ Core seeded");

    await seedOrganizations(prisma);
    console.log("✅ Organizations seeded");

    await seedPeopleUsers(prisma);
    console.log("✅ People & Users seeded");

    await seedUnits(prisma);
    console.log("✅ Units seeded");

    await seedCamps(prisma);
    console.log("✅ Camps seeded");

    await seedFood(prisma);
    console.log("✅ Food seeded");

    await seedUtensils(prisma);
    console.log("✅ Utensils seeded");

    await seedProvidersPrices(prisma);
    console.log("✅ Providers & Prices seeded");

    await seedTransportAccommodation(prisma);
    console.log("✅ Transport & Accommodation seeded");

    await seedActivities(prisma);
    console.log("✅ Activities seeded");

    await seedBudget(prisma);
    console.log("✅ Budget seeded");

    await seedTasksEmergency(prisma);
    console.log("✅ Tasks & Emergency seeded");

    await seedDemodata(prisma);
    console.log("✅ Demo data seeded");

    console.log("\n🎉 Full seed completed!");
  } catch (error) {
    console.error("❌ Error in seed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();