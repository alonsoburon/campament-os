import { PrismaClient } from "../../generated/prisma/index.js";
import { faker } from "@faker-js/faker";
import { ensureUpsert, ensureCompositeUpsert, ensureCreateIfNotExists, pickEnum } from "./helpers.js";

export async function seedTransportAccommodation(prisma: PrismaClient) {
  const camps = await prisma.camp.findMany();
  const participations = await prisma.campParticipation.findMany();

  for (const camp of camps) {
    // Transport
    for (let i = 0; i < 2; i++) {
      const transport = await ensureCreateIfNotExists(
        prisma,
        prisma.transport,
        { name: `${camp.name} - Transport ${i + 1}`, camp_id: camp.id },
        {
          camp_id: camp.id,
          type: pickEnum(["CAR", "BUS", "VAN"]),
          name: `${camp.name} - Transport ${i + 1}`,
          passenger_capacity: faker.number.int({ min: 4, max: 20 }),
          cost: faker.number.float({ min: 50, max: 200 }),
        }
      );

      // Transport assignments
      const campParts = participations.filter(p => p.camp_id === camp.id);
      const transportAssignments = campParts.slice(0, 5).map((part, j) => ({
        participation_person_id: part.person_id,
        participation_camp_id: part.camp_id,
        transport_id: transport.id,
        seat_order: j + 1,
      }));

      await prisma.transportAssignment.createMany({
        data: transportAssignments,
        skipDuplicates: true,
      });
    }

    // Accommodation
    for (let i = 0; i < 3; i++) {
      const accommodation = await ensureCreateIfNotExists(
        prisma,
        prisma.accommodation,
        { name: `${camp.name} - Accommodation ${i + 1}`, camp_id: camp.id },
        {
          camp_id: camp.id,
          type: pickEnum(["TENT", "CABIN", "SHELTER"]),
          name: `${camp.name} - Accommodation ${i + 1}`,
          capacity: faker.number.int({ min: 2, max: 10 }),
          cost: faker.number.float({ min: 20, max: 100 }),
        }
      );

      // Accommodation assignments
      const campParts = participations.filter(p => p.camp_id === camp.id);
      const accommodationAssignments = campParts.slice(0, accommodation.capacity).map(part => ({
        participation_person_id: part.person_id,
        participation_camp_id: part.camp_id,
        accommodation_id: accommodation.id,
      }));

      await prisma.accommodationAssignment.createMany({
        data: accommodationAssignments,
        skipDuplicates: true,
      });
    }
  }
}