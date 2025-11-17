import { PrismaClient } from "../../generated/prisma/index.js";
import { faker } from "@faker-js/faker";
import { ensureUpsert, slugify, pickEnum } from "./helpers.js";

const ORG_TYPES = ["Grupo Scout", "Clan", "Distrito", "Asociación", "Otro"];

export async function seedOrganizations(prisma: PrismaClient) {
  const orgTypes = await prisma.organizationType.findMany();

  for (let i = 0; i < 3; i++) {
    const name = `Org ${i + 1} ${faker.word.noun()}`;
    const type = pickEnum(orgTypes);
    const district = faker.location.city();
    const zone = faker.location.state();

    await ensureUpsert(
      prisma,
      prisma.organization,
      { name },
      {
        name,
        type_id: type.id,
        district,
        zone,
        is_mixed: faker.datatype.boolean(),
        foundation_date: faker.date.past({ years: 20 }),
      }
    );
  }
}