-- AlterTable
ALTER TABLE "public"."Notification" ADD COLUMN     "type" TEXT;

-- CreateTable
CREATE TABLE "public"."IssueStatusHistoryMetadata" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "historyId" TEXT NOT NULL,

    CONSTRAINT "IssueStatusHistoryMetadata_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."IssueStatusHistoryMetadata" ADD CONSTRAINT "IssueStatusHistoryMetadata_historyId_fkey" FOREIGN KEY ("historyId") REFERENCES "public"."IssueStatusHistory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
