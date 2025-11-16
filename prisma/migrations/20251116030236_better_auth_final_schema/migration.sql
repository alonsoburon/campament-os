/*
  Warnings:

  - You are about to drop the column `access_token` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `expires_at` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `id_token` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `provider` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `providerAccountId` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `refresh_token` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `refresh_token_expires_in` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `session_state` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `token_type` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `expires` on the `session` table. All the data in the column will be lost.
  - You are about to drop the column `sessionToken` on the `session` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `invitation_sent_at` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `invitation_status` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `invitation_token` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `pending_group_id` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[providerId,accountId]` on the table `account` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "account_provider_providerAccountId_key";

-- DropIndex
DROP INDEX "session_sessionToken_key";

-- DropIndex
DROP INDEX "users_invitation_token_key";

-- AlterTable
ALTER TABLE "account" DROP COLUMN "access_token",
DROP COLUMN "expires_at",
DROP COLUMN "id_token",
DROP COLUMN "provider",
DROP COLUMN "providerAccountId",
DROP COLUMN "refresh_token",
DROP COLUMN "refresh_token_expires_in",
DROP COLUMN "session_state",
DROP COLUMN "token_type",
DROP COLUMN "type";

-- AlterTable
ALTER TABLE "session" DROP COLUMN "expires",
DROP COLUMN "sessionToken";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "createdAt",
DROP COLUMN "invitation_sent_at",
DROP COLUMN "invitation_status",
DROP COLUMN "invitation_token",
DROP COLUMN "pending_group_id",
DROP COLUMN "updatedAt";

-- CreateIndex
CREATE UNIQUE INDEX "account_providerId_accountId_key" ON "account"("providerId", "accountId");
