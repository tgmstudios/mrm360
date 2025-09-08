-- CreateTable
CREATE TABLE "event_teams" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "teamNumber" INTEGER NOT NULL,
    "wiretapProjectId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_team_members" (
    "id" TEXT NOT NULL,
    "eventTeamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_team_members_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "event_teams_eventId_teamNumber_key" ON "event_teams"("eventId", "teamNumber");

-- CreateIndex
CREATE UNIQUE INDEX "event_team_members_eventTeamId_userId_key" ON "event_team_members"("eventTeamId", "userId");

-- AddForeignKey
ALTER TABLE "event_teams" ADD CONSTRAINT "event_teams_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_team_members" ADD CONSTRAINT "event_team_members_eventTeamId_fkey" FOREIGN KEY ("eventTeamId") REFERENCES "event_teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_team_members" ADD CONSTRAINT "event_team_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
