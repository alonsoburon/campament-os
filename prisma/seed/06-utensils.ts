import { PrismaClient } from "../../generated/prisma/index.js";
import { faker } from "@faker-js/faker";
import { ensureUpsert, ensureCompositeUpsert, ensureCreateIfNotExists, pickEnum } from "./helpers.js";

const UTENSILS = [
  { name: "Olla grande", category: "KITCHEN", description: "Para cocinar grandes cantidades" },
  { name: "Cuchillo", category: "KITCHEN", description: "Para cortar" },
  { name: "Tienda de campaña", category: "CAMPING", description: "Alojamiento" },
];

const DISH_UTENSILS = [
  { dishName: "Arroz con Pollo", utensilName: "Olla grande", quantity: 1 },
  { dishName: "Sándwich de Jamón", utensilName: "Cuchillo", quantity: 1 },
];

export async function seedUtensils(prisma: PrismaClient) {
  const organizations = await prisma.organization.findMany();

  for (const org of organizations) {
    for (const ut of UTENSILS) {
      const utensil = await ensureCreateIfNotExists(
        prisma,
        prisma.utensil,
        { name: `${org.name} - ${ut.name}`, organization_id: org.id },
        {
          ...ut,
          name: `${org.name} - ${ut.name}`,
          organization_id: org.id,
          available_quantity: faker.number.int({ min: 1, max: 5 }),
          status: pickEnum(["GOOD", "FAIR", "NEEDS_MAINTENANCE"]),
        }
      );

      // Dish utensils
      const dishes = await prisma.dish.findMany({ where: { organization_id: org.id } });
      for (const du of DISH_UTENSILS) {
        const dish = dishes.find(d => d.name.includes(du.dishName));
        if (dish && utensil.name.includes(du.utensilName)) {
          await ensureCompositeUpsert(
            prisma,
            prisma.dishUtensil,
            { dish_id: dish.id, utensil_id: utensil.id },
            {
              dish_id: dish.id,
              utensil_id: utensil.id,
              quantity_needed: du.quantity,
            }
          );
        }
      }
    }
  }
}