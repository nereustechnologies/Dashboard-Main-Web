-- CreateEnum
CREATE TYPE "EvalSection" AS ENUM ('mobility', 'strength', 'endurance');

-- CreateEnum
CREATE TYPE "TrainingCategory" AS ENUM ('expand', 'improve', 'injury');

-- AlterTable
ALTER TABLE "TestRating" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "SectionEvaluation" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "section" "EvalSection" NOT NULL,
    "dropdowns" JSONB NOT NULL,
    "comments" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SectionEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingPurpose" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "category" "TrainingCategory" NOT NULL,
    "slot" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "paragraph" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingPurpose_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovementSignature" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "identity" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MovementSignature_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SectionEvaluation_customerId_section_key" ON "SectionEvaluation"("customerId", "section");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingPurpose_customerId_category_slot_key" ON "TrainingPurpose"("customerId", "category", "slot");

-- CreateIndex
CREATE UNIQUE INDEX "MovementSignature_customerId_key" ON "MovementSignature"("customerId");

-- AddForeignKey
ALTER TABLE "SectionEvaluation" ADD CONSTRAINT "SectionEvaluation_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingPurpose" ADD CONSTRAINT "TrainingPurpose_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovementSignature" ADD CONSTRAINT "MovementSignature_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
