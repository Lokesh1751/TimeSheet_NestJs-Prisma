/*
  Warnings:

  - You are about to drop the column `dayType` on the `Timesheet` table. All the data in the column will be lost.
  - Added the required column `day_type` to the `Timesheet` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `costId` on the `Timesheet` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Timesheet" DROP COLUMN "dayType",
ADD COLUMN     "day_type" "DayType" NOT NULL,
DROP COLUMN "costId",
ADD COLUMN     "costId" UUID NOT NULL,
ALTER COLUMN "date" SET DATA TYPE DATE,
ALTER COLUMN "createdAt" DROP NOT NULL,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(6),
ALTER COLUMN "updatedAt" DROP NOT NULL,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(6);
