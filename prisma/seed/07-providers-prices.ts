import { PrismaClient } from "../../generated/prisma/index.js";
import { faker } from "@faker-js/faker";
import { ensureUpsert, ensureCompositeUpsert, ensureCreateIfNotExists } from "./helpers.js";

const PROVIDERS = [
  { name: "Supermercado Local", type: "Grocery" },
  { name: "Proveedor Mayorista", type: "Wholesale" },
];

export async function seedProvidersPrices(prisma: PrismaClient) {
  const organizations = await prisma.organization.findMany();

  for (const org of organizations) {
    for (const prov of PROVIDERS) {
      const provider = await ensureCreateIfNotExists(
        prisma,
        prisma.provider,
        { name: `${org.name} - ${prov.name}`, organization_id: org.id },
        {
          ...prov,
          name: `${org.name} - ${prov.name}`,
          organization_id: org.id,
          address: faker.location.streetAddress(),
          phone: faker.phone.number(),
          email: faker.internet.email(),
        }
      );

      // Ingredient prices
      const ingredients = await prisma.ingredient.findMany({ where: { organization_id: org.id } });
      const pricesData = ingredients.map(ing => ({
        ingredient_id: ing.id,
        provider_id: provider.id,
        unit_price: faker.number.float({ min: 1, max: 10 }),
        is_current_price: true,
      }));

      await prisma.ingredientPrice.createMany({
        data: pricesData,
        skipDuplicates: true,
      });
    }
  }
}