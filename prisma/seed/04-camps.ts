import { PrismaClient } from "../../generated/prisma/index.js";
import { faker } from "@faker-js/faker";
import { ensureUpsert, ensureCompositeUpsert, ensureCreateIfNotExists, addDays } from "./helpers.js";

export async function seedCamps(prisma: PrismaClient) {
  const organizations = await prisma.organization.findMany();
  const persons = await prisma.person.findMany();

  for (const org of organizations) {
    for (let i = 0; i < 2; i++) {
      const startDate = faker.date.future({ years: 1 });
      const endDate = addDays(startDate, 7);
      const name = `Camp ${org.name} ${startDate.getFullYear()}`;

      const camp = await ensureCreateIfNotExists(
        prisma,
        prisma.camp,
        { name, organization_id: org.id },
        {
          name,
          location: faker.location.city(),
          start_date: startDate,
          end_date: endDate,
          fee_cost: faker.number.float({ min: 50, max: 200 }),
          organization_id: org.id,
        }
      );

      // Camp participations
      const participants = persons.slice(0, 5);
      const participationsData = participants.map((person, idx) => ({
        person_id: person.id,
        camp_id: camp.id,
        payment_made: faker.datatype.boolean(),
        registration_date: faker.date.recent({ days: 30 }),
        is_camp_director: i === 0 && idx === 0,
      }));

      await prisma.campParticipation.createMany({
        data: participationsData,
        skipDuplicates: true,
      });
    }
  }
}