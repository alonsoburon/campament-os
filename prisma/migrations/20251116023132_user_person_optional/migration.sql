-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_person_id_fkey";

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "person_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "people"("id") ON DELETE SET NULL ON UPDATE CASCADE;
