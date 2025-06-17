/*
  Warnings:

  - You are about to drop the column `rating` on the `MovementSignature` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MovementSignature" DROP COLUMN "rating",
ADD COLUMN     "enduranceRating" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "mobilityRating" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "strengthRating" INTEGER NOT NULL DEFAULT 5;
