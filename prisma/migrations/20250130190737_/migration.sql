/*
  Warnings:

  - Added the required column `entity` to the `auth-codes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `entityId` to the `auth-codes` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EntityEnumAuthCode" AS ENUM ('INSTITUTION', 'PATIENT', 'PROVIDER');

-- AlterTable
ALTER TABLE "auth-codes" ADD COLUMN     "entity" "EntityEnumAuthCode" NOT NULL,
ADD COLUMN     "entityId" TEXT NOT NULL;
