/*
  Warnings:

  - The values [EXCELLENT] on the enum `UtensilStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `group_id` on the `camps` table. All the data in the column will be lost.
  - You are about to drop the column `group_id` on the `dishes` table. All the data in the column will be lost.
  - You are about to drop the column `group_id` on the `ingredients` table. All the data in the column will be lost.
  - You are about to drop the column `group_id` on the `providers` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `unit_assistants` table. All the data in the column will be lost.
  - You are about to drop the column `branch` on the `units` table. All the data in the column will be lost.
  - You are about to drop the column `group_id` on the `units` table. All the data in the column will be lost.
  - You are about to drop the column `pending_system_role` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `system_role` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `group_id` on the `utensils` table. All the data in the column will be lost.
  - You are about to drop the `person_groups` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `scout_groups` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name,organization_id]` on the table `dishes` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,organization_id]` on the table `ingredients` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `organization_id` to the `camps` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization_id` to the `dishes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization_id` to the `ingredients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role_id` to the `unit_assistants` table without a default value. This is not possible if the table is not empty.
  - Added the required column `branch_id` to the `units` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization_id` to the `units` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RoleScope" AS ENUM ('SYSTEM', 'ORGANIZATION', 'UNIT');

-- AlterEnum
BEGIN;
CREATE TYPE "UtensilStatus_new" AS ENUM ('GOOD', 'FAIR', 'NEEDS_MAINTENANCE', 'UNAVAILABLE');
ALTER TABLE "utensils" ALTER COLUMN "status" TYPE "UtensilStatus_new" USING ("status"::text::"UtensilStatus_new");
ALTER TYPE "UtensilStatus" RENAME TO "UtensilStatus_old";
ALTER TYPE "UtensilStatus_new" RENAME TO "UtensilStatus";
DROP TYPE "public"."UtensilStatus_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "camps" DROP CONSTRAINT "camps_group_id_fkey";

-- DropForeignKey
ALTER TABLE "dishes" DROP CONSTRAINT "dishes_group_id_fkey";

-- DropForeignKey
ALTER TABLE "ingredients" DROP CONSTRAINT "ingredients_group_id_fkey";

-- DropForeignKey
ALTER TABLE "person_groups" DROP CONSTRAINT "person_groups_group_id_fkey";

-- DropForeignKey
ALTER TABLE "person_groups" DROP CONSTRAINT "person_groups_person_id_fkey";

-- DropForeignKey
ALTER TABLE "providers" DROP CONSTRAINT "providers_group_id_fkey";

-- DropForeignKey
ALTER TABLE "scout_groups" DROP CONSTRAINT "scout_groups_creator_id_fkey";

-- DropForeignKey
ALTER TABLE "scout_groups" DROP CONSTRAINT "scout_groups_updater_id_fkey";

-- DropForeignKey
ALTER TABLE "units" DROP CONSTRAINT "units_group_id_fkey";

-- DropForeignKey
ALTER TABLE "utensils" DROP CONSTRAINT "utensils_group_id_fkey";

-- DropIndex
DROP INDEX "dishes_name_group_id_key";

-- DropIndex
DROP INDEX "ingredients_name_group_id_key";

-- AlterTable
ALTER TABLE "camps" DROP COLUMN "group_id",
ADD COLUMN     "organization_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "dishes" DROP COLUMN "group_id",
ADD COLUMN     "organization_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "ingredients" DROP COLUMN "group_id",
ADD COLUMN     "organization_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "providers" DROP COLUMN "group_id",
ADD COLUMN     "organization_id" INTEGER;

-- AlterTable
ALTER TABLE "unit_assistants" DROP COLUMN "role",
ADD COLUMN     "role_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "units" DROP COLUMN "branch",
DROP COLUMN "group_id",
ADD COLUMN     "branch_id" INTEGER NOT NULL,
ADD COLUMN     "organization_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "pending_system_role",
DROP COLUMN "system_role",
ADD COLUMN     "pending_system_role_id" INTEGER,
ADD COLUMN     "system_role_id" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "utensils" DROP COLUMN "group_id",
ADD COLUMN     "organization_id" INTEGER;

-- DropTable
DROP TABLE "person_groups";

-- DropTable
DROP TABLE "scout_groups";

-- DropEnum
DROP TYPE "GroupRole";

-- DropEnum
DROP TYPE "ScoutBranch";

-- DropEnum
DROP TYPE "SystemRole";

-- DropEnum
DROP TYPE "UnitRole";

-- CreateTable
CREATE TABLE "organization_types" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "scope" "RoleScope" NOT NULL,
    "description" TEXT,
    "organization_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "branches" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "organization_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "branches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type_id" INTEGER NOT NULL,
    "number" INTEGER,
    "district" TEXT,
    "zone" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "group_email" TEXT,
    "is_mixed" BOOLEAN NOT NULL DEFAULT false,
    "foundation_date" DATE,
    "primary_color" DOUBLE PRECISION,
    "secondary_color" DOUBLE PRECISION,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "creator_id" INTEGER,
    "updater_id" INTEGER,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_members" (
    "person_id" INTEGER NOT NULL,
    "organization_id" INTEGER NOT NULL,
    "role_id" INTEGER NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organization_members_pkey" PRIMARY KEY ("person_id","organization_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organization_types_name_key" ON "organization_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_organization_id_key" ON "roles"("name", "organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "branches_name_organization_id_key" ON "branches"("name", "organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_name_key" ON "organizations"("name");

-- CreateIndex
CREATE UNIQUE INDEX "dishes_name_organization_id_key" ON "dishes"("name", "organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "ingredients_name_organization_id_key" ON "ingredients"("name", "organization_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_system_role_id_fkey" FOREIGN KEY ("system_role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_pending_system_role_id_fkey" FOREIGN KEY ("pending_system_role_id") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branches" ADD CONSTRAINT "branches_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "organization_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("person_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_updater_id_fkey" FOREIGN KEY ("updater_id") REFERENCES "users"("person_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "units" ADD CONSTRAINT "units_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "units" ADD CONSTRAINT "units_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "camps" ADD CONSTRAINT "camps_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "people"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unit_assistants" ADD CONSTRAINT "unit_assistants_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingredients" ADD CONSTRAINT "ingredients_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dishes" ADD CONSTRAINT "dishes_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "utensils" ADD CONSTRAINT "utensils_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "providers" ADD CONSTRAINT "providers_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
