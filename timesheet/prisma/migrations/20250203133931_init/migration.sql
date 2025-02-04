-- CreateEnum
CREATE TYPE "DayType" AS ENUM ('working', 'sick', 'vacation');

-- CreateTable
CREATE TABLE "Timesheet" (
    "id" TEXT NOT NULL,
    "costId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "workingHours" INTEGER NOT NULL,
    "dayType" "DayType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Timesheet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Timesheet_date_key" ON "Timesheet"("date");
