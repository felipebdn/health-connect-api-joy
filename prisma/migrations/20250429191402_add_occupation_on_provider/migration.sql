/*
  Warnings:

  - Added the required column `occupation` to the `providers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "providers" ADD COLUMN     "occupation" TEXT NOT NULL;
