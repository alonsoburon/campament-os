import { PrismaClient } from "../../generated/prisma/index.js";
import { faker } from "@faker-js/faker";
import { ensureUpsert, ensureCreateIfNotExists } from "./helpers.js";

export async function seedPeopleUsers(prisma: PrismaClient) {
  const peopleData = [];
  const usersData = [];

  for (let i = 0; i < 10; i++) {
    const fullName = faker.person.fullName();
    const email = `user${i + 1}@fake.dev`;
    const phone = faker.phone.number();

    peopleData.push({
      full_name: fullName,
      phone,
      birth_date: faker.date.birthdate({ min: 10, max: 80, mode: "age" }),
    });

    usersData.push({
      name: fullName,
      email,
      emailVerified: true,
    });
  }

  // Batch create people
  await prisma.person.createMany({
    data: peopleData,
    skipDuplicates: true,
  });

  // Get created people
  const people = await prisma.person.findMany({
    orderBy: { id: 'asc' },
    take: 10,
  });

  // Link users to people
  for (let i = 0; i < usersData.length && i < people.length; i++) {
    await ensureUpsert(
      prisma,
      prisma.user,
      { email: usersData[i]!.email },
      {
        ...usersData[i],
        person_id: people[i]!.id,
      }
    );
  }
}