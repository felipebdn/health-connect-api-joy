/*
  Warnings:

  - You are about to drop the `AffiliationCode` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `auth-codes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AffiliationCode" DROP CONSTRAINT "AffiliationCode_institution_id_fkey";

-- DropForeignKey
ALTER TABLE "AffiliationCode" DROP CONSTRAINT "AffiliationCode_provider_id_fkey";

-- DropTable
DROP TABLE "AffiliationCode";

-- DropTable
DROP TABLE "auth-codes";

-- CreateTable
CREATE TABLE "auth_codes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "entity" "EntityEnumAuthCode" NOT NULL,
    "entityId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "affiliation_codes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "institution_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "affiliation_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "auth_codes_code_key" ON "auth_codes"("code");

-- CreateIndex
CREATE UNIQUE INDEX "affiliation_codes_code_key" ON "affiliation_codes"("code");

-- AddForeignKey
ALTER TABLE "affiliation_codes" ADD CONSTRAINT "affiliation_codes_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "affiliation_codes" ADD CONSTRAINT "affiliation_codes_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
