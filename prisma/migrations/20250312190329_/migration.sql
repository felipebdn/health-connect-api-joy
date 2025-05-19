-- DropForeignKey
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_institution_id_fkey";

-- AlterTable
ALTER TABLE "appointments" ALTER COLUMN "institution_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
