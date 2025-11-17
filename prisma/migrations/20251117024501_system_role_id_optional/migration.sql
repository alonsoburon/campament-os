-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_system_role_id_fkey";

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "system_role_id" DROP NOT NULL,
ALTER COLUMN "system_role_id" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "camps_organization_id_idx" ON "camps"("organization_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_system_role_id_fkey" FOREIGN KEY ("system_role_id") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
