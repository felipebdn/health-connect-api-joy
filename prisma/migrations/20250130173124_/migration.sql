/*
  Warnings:

  - A unique constraint covering the columns `[phone]` on the table `institutions` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "institutions_phone_key" ON "institutions"("phone");
