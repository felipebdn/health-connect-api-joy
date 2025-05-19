-- DropForeignKey
ALTER TABLE "events" DROP CONSTRAINT "events_institution_id_fkey";

-- AlterTable
ALTER TABLE "events" ALTER COLUMN "institution_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
