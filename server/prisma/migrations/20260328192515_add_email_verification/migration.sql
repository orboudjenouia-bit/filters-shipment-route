-- AlterTable
ALTER TABLE "Route" ADD COLUMN IF NOT EXISTS "user_ID" INTEGER;
ALTER TABLE "Route" ALTER COLUMN "status" SET DEFAULT 'Active';

-- AlterTable
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "verificationToken" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "verificationTokenExpires" TIMESTAMP(3);
