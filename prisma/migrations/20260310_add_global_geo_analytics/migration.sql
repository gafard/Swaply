-- CreateEnum
CREATE TYPE "ItemReportStatus" AS ENUM ('PENDING', 'REVIEWED', 'REJECTED', 'ACTIONED');

-- CreateTable
CREATE TABLE "ItemMetric" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "totalViews" INTEGER NOT NULL DEFAULT 0,
    "uniqueViews" INTEGER NOT NULL DEFAULT 0,
    "favoritesCount" INTEGER NOT NULL DEFAULT 0,
    "reportsCount" INTEGER NOT NULL DEFAULT 0,
    "lastViewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ItemMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemView" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "viewerId" TEXT,
    "sessionId" TEXT,
    "viewCount" INTEGER NOT NULL DEFAULT 1,
    "firstViewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastViewedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ItemView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemReport" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "details" TEXT,
    "status" "ItemReportStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ItemReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ItemMetric_itemId_key" ON "ItemMetric"("itemId");

-- CreateIndex
CREATE INDEX "ItemView_itemId_lastViewedAt_idx" ON "ItemView"("itemId", "lastViewedAt");

-- CreateIndex
CREATE INDEX "ItemView_viewerId_idx" ON "ItemView"("viewerId");

-- CreateIndex
CREATE UNIQUE INDEX "ItemView_itemId_viewerId_key" ON "ItemView"("itemId", "viewerId");

-- CreateIndex
CREATE UNIQUE INDEX "ItemView_itemId_sessionId_key" ON "ItemView"("itemId", "sessionId");

-- CreateIndex
CREATE INDEX "ItemReport_status_createdAt_idx" ON "ItemReport"("status", "createdAt");

-- CreateIndex
CREATE INDEX "ItemReport_reporterId_createdAt_idx" ON "ItemReport"("reporterId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ItemReport_itemId_reporterId_key" ON "ItemReport"("itemId", "reporterId");

-- AddForeignKey
ALTER TABLE "ItemMetric" ADD CONSTRAINT "ItemMetric_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemView" ADD CONSTRAINT "ItemView_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemView" ADD CONSTRAINT "ItemView_viewerId_fkey" FOREIGN KEY ("viewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemReport" ADD CONSTRAINT "ItemReport_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemReport" ADD CONSTRAINT "ItemReport_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

