-- AlterTable
ALTER TABLE "events" ADD COLUMN     "autoAssignEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "membersPerTeam" INTEGER DEFAULT 4;
