-- AlterTable
ALTER TABLE "Subscription" ALTER COLUMN "endDate" SET DEFAULT (CURRENT_TIMESTAMP + interval '1 month');

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "password" DROP NOT NULL;
