-- AlterTable
ALTER TABLE "Achievement" ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'REGISTROS';

-- CreateTable
CREATE TABLE "AchievementProcessingLog" (
    "id" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "totalUsers" INTEGER NOT NULL DEFAULT 0,
    "processedUsers" INTEGER NOT NULL DEFAULT 0,
    "awardedCount" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AchievementProcessingLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AchievementProcessingLog_achievementId_status_idx" ON "AchievementProcessingLog"("achievementId", "status");

-- AddForeignKey
ALTER TABLE "AchievementProcessingLog" ADD CONSTRAINT "AchievementProcessingLog_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "Achievement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
