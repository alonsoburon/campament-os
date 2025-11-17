import { PrismaClient } from "../../generated/prisma/index.js";
import { faker } from "@faker-js/faker";
import { ensureUpsert, ensureCompositeUpsert, pickEnum } from "./helpers.js";

export async function seedDemodata(prisma: PrismaClient) {
  const camps = await prisma.camp.findMany();
  const dishes = await prisma.dish.findMany();

  for (const camp of camps) {
    const campDishes = dishes.filter(d => d.organization_id === camp.organization_id);
    for (const dish of campDishes.slice(0, 2)) {
      await ensureCompositeUpsert(
        prisma,
        prisma.campMenu,
        { camp_id: camp.id, dish_id: dish.id, date: camp.start_date, meal_type: pickEnum(["BREAKFAST", "LUNCH", "DINNER"]) },
        {
          camp_id: camp.id,
          dish_id: dish.id,
          date: camp.start_date,
          meal_type: pickEnum(["BREAKFAST", "LUNCH", "DINNER"]),
          number_of_servings: faker.number.int({ min: 10, max: 50 }),
        }
      );
    }
  }
}