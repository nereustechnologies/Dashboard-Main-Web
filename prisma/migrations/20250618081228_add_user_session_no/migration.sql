/*
  Warnings:

  - A unique constraint covering the columns `[UniqueId]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Customer_UniqueId_key" ON "Customer"("UniqueId");
