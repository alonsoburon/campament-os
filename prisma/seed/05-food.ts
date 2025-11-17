import { PrismaClient } from "../../generated/prisma/index.js";
import { faker } from "@faker-js/faker";
import { ensureUpsert, ensureCompositeUpsert } from "./helpers.js";

const INGREDIENTS = [
  { name: "Arroz", category: "Granos", unit_of_measure: "kg" },
  { name: "Pollo", category: "Proteína", unit_of_measure: "kg" },
  { name: "Leche", category: "Lácteos", unit_of_measure: "L" },
  { name: "Pan", category: "Panadería", unit_of_measure: "kg" },
  { name: "Tomate", category: "Verduras", unit_of_measure: "kg" },
];

const DISHES = [
  { name: "Arroz con Pollo", meal_type: "LUNCH", instructions: "Cocinar arroz y pollo juntos." },
  { name: "Sándwich de Jamón", meal_type: "BREAKFAST", instructions: "Armar sándwich." },
  { name: "Ensalada de Tomate", meal_type: "DINNER", instructions: "Cortar tomates." },
];

export async function seedFood(prisma: PrismaClient) {
  const organizations = await prisma.organization.findMany();

  for (const org of organizations) {
    // Ingredients
    for (const ing of INGREDIENTS) {
      await ensureUpsert(
        prisma,
        prisma.ingredient,
        { name_organization_id: { name: ing.name, organization_id: org.id } },
        {
          ...ing,
          organization_id: org.id,
          description: faker.lorem.sentence(),
        }
      );
    }

    // Dishes
    for (const dish of DISHES) {
      const createdDish = await ensureUpsert(
        prisma,
        prisma.dish,
        { name_organization_id: { name: dish.name, organization_id: org.id } },
        {
          ...dish,
          organization_id: org.id,
          description: faker.lorem.sentence(),
          base_servings: faker.number.int({ min: 4, max: 10 }),
        }
      );

      // Dish ingredients
      const ingredients = await prisma.ingredient.findMany({ where: { organization_id: org.id } });
      const dishIngredientsData = ingredients.slice(0, 3).map(ing => ({
        dish_id: createdDish.id,
        ingredient_id: ing.id,
        quantity: faker.number.float({ min: 0.5, max: 2 }),
        unit: ing.unit_of_measure,
      }));

      await prisma.dishIngredient.createMany({
        data: dishIngredientsData,
        skipDuplicates: true,
      });
    }
  }
}