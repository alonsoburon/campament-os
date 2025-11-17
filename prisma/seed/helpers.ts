import { PrismaClient } from "../../generated/prisma/index.js";
import { faker } from "@faker-js/faker";

faker.seed(42); // Deterministic seed for repeatability

export const slugify = (s: string): string =>
  s.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim().replace(/\s+/g, "-");

export const pickEnum = <T>(arr: readonly T[]): T =>
  arr[Math.floor(Math.random() * arr.length)] as T;

export const addDays = (base: Date, days: number): Date =>
  new Date(base.getTime() + days * 86400000);

export const ensureUpsert = async <T extends Record<string, any>>(
  prisma: PrismaClient,
  model: any,
  where: T,
  create: any,
  update?: any
) => {
  return await model.upsert({
    where,
    update: update || {},
    create,
  });
};

export const ensureUpsertMany = async (
  prisma: PrismaClient,
  model: any,
  items: { where: any; create: any; update?: any }[]
) => {
  for (const item of items) {
    await ensureUpsert(prisma, model, item.where, item.create, item.update);
  }
};

export const ensureCreateIfNotExists = async (
  prisma: PrismaClient,
  model: any,
  where: any,
  create: any
) => {
  const existing = await model.findFirst({ where });
  if (!existing) {
    return await model.create({ data: create });
  }
  return existing;
};

export const ensureCompositeUpsert = async (
  prisma: PrismaClient,
  model: any,
  compositeKey: Record<string, any>,
  create: any,
  update?: any
) => {
  const existing = await model.findFirst({ where: compositeKey });
  if (existing) {
    if (update) {
      return await model.update({ where: { id: existing.id }, data: update });
    }
    return existing;
  }
  return await model.create({ data: create });
};