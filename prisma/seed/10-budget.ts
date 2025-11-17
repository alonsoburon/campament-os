import { PrismaClient } from "../../generated/prisma/index.js";
import { faker } from "@faker-js/faker";
import { ensureUpsert, ensureCompositeUpsert, ensureCreateIfNotExists, pickEnum } from "./helpers.js";

export async function seedBudget(prisma: PrismaClient) {
  const camps = await prisma.camp.findMany();
  const ingredients = await prisma.ingredient.findMany();
  const transports = await prisma.transport.findMany();
  const accommodations = await prisma.accommodation.findMany();

  for (const camp of camps) {
    const budget = await ensureUpsert(
      prisma,
      prisma.budget,
      { camp_id: camp.id },
      {
        camp_id: camp.id,
        name: `Budget for ${camp.name}`,
        estimated_food_cost: faker.number.float({ min: 100, max: 500 }),
        estimated_transport_cost: faker.number.float({ min: 50, max: 200 }),
        estimated_accommodation_cost: faker.number.float({ min: 100, max: 300 }),
      }
    );

    // Budget items
    const items = [
      ...ingredients.slice(0, 2).map(ing => ({
        type: "FOOD" as const,
        quantity: faker.number.float({ min: 1, max: 10 }),
        unit_price: faker.number.float({ min: 1, max: 5 }),
        ingredient_id: ing.id,
      })),
      ...transports.filter(t => t.camp_id === camp.id).slice(0, 1).map(t => ({
        type: "TRANSPORT" as const,
        quantity: 1,
        unit_price: t.cost || 0,
        transport_id: t.id,
      })),
      ...accommodations.filter(a => a.camp_id === camp.id).slice(0, 1).map(a => ({
        type: "ACCOMMODATION" as const,
        quantity: 1,
        unit_price: a.cost || 0,
        accommodation_id: a.id,
      })),
    ];

    for (const item of items) {
      const data: any = {
        budget_id: budget.id,
        type: item.type,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.quantity * item.unit_price,
      };
      if ('ingredient_id' in item) data.ingredient_id = item.ingredient_id;
      if ('transport_id' in item) data.transport_id = item.transport_id;
      if ('accommodation_id' in item) data.accommodation_id = item.accommodation_id;

      await ensureCreateIfNotExists(
        prisma,
        prisma.budgetItem,
        { budget_id: budget.id, type: item.type, quantity: item.quantity },
        data
      );
    }
  }
}