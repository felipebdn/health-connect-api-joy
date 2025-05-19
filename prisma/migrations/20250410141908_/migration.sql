/*
  Warnings:

  - Added the required column `name` to the `ratings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ratings" ADD COLUMN     "name" TEXT NOT NULL;
