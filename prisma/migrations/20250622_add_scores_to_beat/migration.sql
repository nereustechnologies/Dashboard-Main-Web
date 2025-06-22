CREATE TABLE "ScoresToBeat" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "customerId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "current" INTEGER NOT NULL,
  "best" INTEGER NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  "updatedAt" TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE "ScoresToBeat"
ADD CONSTRAINT "ScoresToBeat_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE CASCADE;

CREATE UNIQUE INDEX "ScoresToBeat_customerId_title_key" ON "ScoresToBeat" ("customerId", "title");
