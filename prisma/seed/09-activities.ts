import { PrismaClient } from "../../generated/prisma/index.js";
import { faker } from "@faker-js/faker";
import { ensureUpsert, ensureCompositeUpsert, ensureCreateIfNotExists } from "./helpers.js";

const ACTIVITIES = [
  { name: "Fogata Nocturna", type: "Social" },
  { name: "Excursión", type: "Adventure" },
  { name: "Taller de Nudos", type: "Skill" },
];

export async function seedActivities(prisma: PrismaClient) {
  const camps = await prisma.camp.findMany();
  const units = await prisma.unit.findMany();
  const persons = await prisma.person.findMany();

  for (const camp of camps) {
    for (const act of ACTIVITIES) {
      const leader = persons[Math.floor(Math.random() * persons.length)]!;
      const activity = await ensureCreateIfNotExists(
        prisma,
        prisma.activity,
        { name: `${camp.name} - ${act.name}`, camp_id: camp.id },
        {
          camp_id: camp.id,
          name: `${camp.name} - ${act.name}`,
          description: faker.lorem.sentence(),
          date: faker.date.between({ from: camp.start_date, to: camp.end_date }),
          start_time: faker.string.numeric(4), // HHMM
          duration_minutes: faker.number.int({ min: 30, max: 180 }),
          location: faker.location.city(),
          leader_responsible_id: leader.id,
        }
      );

      // Activity units
      const campUnits = units.filter(u => u.organization_id === camp.organization_id);
      const activityUnitsData = campUnits.slice(0, 2).map(unit => ({
        activity_id: activity.id,
        unit_id: unit.id,
      }));

      await prisma.activityUnit.createMany({
        data: activityUnitsData,
        skipDuplicates: true,
      });
    }
  }
}