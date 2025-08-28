/*
  Warnings:

  - You are about to drop the `background_subtasks` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "background_subtasks" DROP CONSTRAINT "background_subtasks_taskId_fkey";

-- AlterTable
ALTER TABLE "background_tasks" ADD COLUMN     "parentTaskId" TEXT,
ADD COLUMN     "stepIndex" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "background_subtasks";

-- AddForeignKey
ALTER TABLE "background_tasks" ADD CONSTRAINT "background_tasks_parentTaskId_fkey" FOREIGN KEY ("parentTaskId") REFERENCES "background_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
