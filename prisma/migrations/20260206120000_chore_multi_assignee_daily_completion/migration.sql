-- CreateTable: ChoreAssignment (many-to-many chore-user assignments)
CREATE TABLE "ChoreAssignment" (
    "id" TEXT NOT NULL,
    "choreId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChoreAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChoreAssignment_choreId_userId_key" ON "ChoreAssignment"("choreId", "userId");

-- AddForeignKey
ALTER TABLE "ChoreAssignment" ADD CONSTRAINT "ChoreAssignment_choreId_fkey" FOREIGN KEY ("choreId") REFERENCES "Chore"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChoreAssignment" ADD CONSTRAINT "ChoreAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Migrate existing assignedToId data into ChoreAssignment rows
INSERT INTO "ChoreAssignment" ("id", "choreId", "userId", "createdAt")
SELECT
    gen_random_uuid()::text,
    "id",
    "assignedToId",
    "createdAt"
FROM "Chore"
WHERE "assignedToId" IS NOT NULL;

-- Drop old foreign key and column
ALTER TABLE "Chore" DROP CONSTRAINT "Chore_assignedToId_fkey";
ALTER TABLE "Chore" DROP COLUMN "assignedToId";

-- Rename weekOf to completionDate on ChoreCompletion
-- First drop the old unique constraint
DROP INDEX "ChoreCompletion_choreId_completedBy_weekOf_key";

-- Rename column
ALTER TABLE "ChoreCompletion" RENAME COLUMN "weekOf" TO "completionDate";

-- Create new unique constraint with renamed column
CREATE UNIQUE INDEX "ChoreCompletion_choreId_completedBy_completionDate_key" ON "ChoreCompletion"("choreId", "completedBy", "completionDate");
