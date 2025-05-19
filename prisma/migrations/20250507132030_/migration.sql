-- CreateEnum
CREATE TYPE "StatusAffiliation" AS ENUM ('ACTIVE', 'PAUSED');

-- AlterTable
ALTER TABLE "provider_institution" ADD COLUMN     "status" "StatusAffiliation" NOT NULL DEFAULT 'ACTIVE';
