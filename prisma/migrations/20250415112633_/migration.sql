-- CreateEnum
CREATE TYPE "TypeUser" AS ENUM ('INSTITUTION', 'PATIENT', 'PROVIDER');

-- CreateEnum
CREATE TYPE "TypeNotification" AS ENUM ('MAKE_RATING', 'APPOINTMENT_ALERT');

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "typeNotification" "TypeNotification" NOT NULL,
    "content" TEXT NOT NULL,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recipientId" TEXT NOT NULL,
    "type" "TypeUser" NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);
