import { PrismaClient } from "../../generated/prisma/index.js";
import { faker } from "@faker-js/faker";
import { ensureUpsert, ensureCreateIfNotExists, pickEnum } from "./helpers.js";

export async function seedTasksEmergency(prisma: PrismaClient) {
  const camps = await prisma.camp.findMany();
  const persons = await prisma.person.findMany();

  for (const camp of camps) {
    // Tasks
    for (let i = 0; i < 3; i++) {
      const assigned = persons[Math.floor(Math.random() * persons.length)]!;
      await ensureCreateIfNotExists(
        prisma,
        prisma.task,
        { title: `Task ${i + 1} for ${camp.name}`, camp_id: camp.id },
        {
          camp_id: camp.id,
          title: `Task ${i + 1} for ${camp.name}`,
          description: faker.lorem.sentence(),
          status: pickEnum(["PENDING", "IN_PROGRESS", "COMPLETED"]),
          priority: pickEnum(["LOW", "MEDIUM", "HIGH"]),
          due_date: faker.date.future({ years: 1 }),
          assigned_to_person_id: assigned.id,
        }
      );
    }

    // Emergency contacts
    for (let i = 0; i < 2; i++) {
      await ensureCreateIfNotExists(
        prisma,
        prisma.emergencyContact,
        { name: `Emergency ${i + 1} for ${camp.name}`, camp_id: camp.id },
        {
          camp_id: camp.id,
          name: `Emergency ${i + 1} for ${camp.name}`,
          type: faker.word.noun(),
          phone: faker.phone.number(),
          email: faker.internet.email(),
          is_primary: i === 0,
        }
      );
    }
  }
}