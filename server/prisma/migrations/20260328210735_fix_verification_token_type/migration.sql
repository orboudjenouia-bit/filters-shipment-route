-- AlterTable
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isVerified" BOOLEAN NOT NULL DEFAULT false;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'User' AND column_name = 'isverified'
  ) THEN
    ALTER TABLE "User" DROP COLUMN "isverified";
  END IF;
END $$;

ALTER TABLE "User" ALTER COLUMN "verificationToken" SET DATA TYPE TEXT;
