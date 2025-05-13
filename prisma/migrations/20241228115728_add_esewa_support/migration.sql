/*
  Warnings:

  - A unique constraint covering the columns `[esewa_payment_id]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "acceptedTermsVersionId" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "esewa_current_period_end" TIMESTAMP(3),
ADD COLUMN     "esewa_payment_id" TEXT,
ADD COLUMN     "hasAcceptedTerms" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "paymentMethod" TEXT NOT NULL DEFAULT 'Stripe';

-- CreateTable
CREATE TABLE "TermsAndConditions" (
    "id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "TermsAndConditions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TermsAndConditions_version_key" ON "TermsAndConditions"("version");

-- CreateIndex
CREATE UNIQUE INDEX "User_esewa_payment_id_key" ON "User"("esewa_payment_id");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_acceptedTermsVersionId_fkey" FOREIGN KEY ("acceptedTermsVersionId") REFERENCES "TermsAndConditions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
