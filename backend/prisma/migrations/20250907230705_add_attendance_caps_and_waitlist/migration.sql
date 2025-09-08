-- AlterEnum
ALTER TYPE "RSVPStatus" ADD VALUE 'WAITLIST';

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "attendanceCap" INTEGER,
ADD COLUMN     "waitlistEnabled" BOOLEAN NOT NULL DEFAULT false;
