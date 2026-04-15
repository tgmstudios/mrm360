-- CreateTable (if not exists)
CREATE TABLE IF NOT EXISTS "workshop_series" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "badgeClassId" TEXT,
    "requiredCheckIns" INTEGER NOT NULL DEFAULT 1,
    "autoIssue" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workshop_series_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "seriesId" TEXT;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'events_seriesId_fkey') THEN
        ALTER TABLE "events" ADD CONSTRAINT "events_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "workshop_series"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
