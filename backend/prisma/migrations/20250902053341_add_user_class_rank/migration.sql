-- CreateEnum
CREATE TYPE "ClassRankType" AS ENUM ('FIRST_YEAR', 'SECOND_YEAR', 'THIRD_YEAR', 'FOURTH_YEAR', 'ALUMNI_OTHER');

-- CreateTable
CREATE TABLE "user_class_ranks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "classRank" "ClassRankType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_class_ranks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_class_ranks_userId_key" ON "user_class_ranks"("userId");

-- AddForeignKey
ALTER TABLE "user_class_ranks" ADD CONSTRAINT "user_class_ranks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
