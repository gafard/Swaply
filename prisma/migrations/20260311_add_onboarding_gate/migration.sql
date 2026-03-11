ALTER TABLE "User"
ADD COLUMN "hasCompletedOnboarding" BOOLEAN NOT NULL DEFAULT false;

UPDATE "User"
SET "hasCompletedOnboarding" = true
WHERE "countryId" IS NOT NULL
  AND "cityId" IS NOT NULL
  AND "zoneId" IS NOT NULL;
