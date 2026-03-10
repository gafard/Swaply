-- AlterTable: Remove imageUrl from Item (now using ItemImage table)
ALTER TABLE "Item" DROP COLUMN IF EXISTS "imageUrl";

-- Add CHECK constraint for trustScore >= 0
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'User'
      AND column_name = 'trustScore'
  ) AND NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'User_trustScore_check'
  ) THEN
    ALTER TABLE "User"
      ADD CONSTRAINT "User_trustScore_check" CHECK ("trustScore" >= 0);
  END IF;
END $$;

-- Add CHECK constraint for credits >= 0
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'User'
      AND column_name = 'credits'
  ) AND NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'User_credits_check'
  ) THEN
    ALTER TABLE "User"
      ADD CONSTRAINT "User_credits_check" CHECK ("credits" >= 0);
  END IF;
END $$;

-- CreateEnum: ReportStatus
DO $$ BEGIN
    CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'RESOLVED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AlterTable: Add status column to Report
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'Report'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'Report'
      AND column_name = 'status'
  ) THEN
    ALTER TABLE "Report"
      ADD COLUMN "status" "ReportStatus" NOT NULL DEFAULT 'PENDING';
  END IF;
END $$;

-- CreateIndex: Add index on Report.status
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'Report'
      AND column_name = 'status'
  ) THEN
    CREATE INDEX IF NOT EXISTS "Report_status_idx" ON "Report"("status");
  END IF;
END $$;
