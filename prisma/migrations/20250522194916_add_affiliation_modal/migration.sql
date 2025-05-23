-- CreateTable
CREATE TABLE "AffiliationCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "institution_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AffiliationCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AffiliationCode_code_key" ON "AffiliationCode"("code");

-- AddForeignKey
ALTER TABLE "AffiliationCode" ADD CONSTRAINT "AffiliationCode_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffiliationCode" ADD CONSTRAINT "AffiliationCode_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
