ALTER TABLE "Notification"
  ALTER COLUMN "title" DROP NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'Notification' AND column_name = 'payload'
  ) THEN
    ALTER TABLE "Notification" ADD COLUMN "payload" JSONB;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'Notification' AND column_name = 'type' AND udt_name = 'NotificationType'
  ) THEN
    ALTER TABLE "Notification"
      ALTER COLUMN "type" DROP NOT NULL,
      ALTER COLUMN "type" TYPE TEXT USING "type"::TEXT;
  ELSIF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'Notification' AND column_name = 'type'
  ) THEN
    ALTER TABLE "Notification" ADD COLUMN "type" TEXT;
  END IF;
END $$;
