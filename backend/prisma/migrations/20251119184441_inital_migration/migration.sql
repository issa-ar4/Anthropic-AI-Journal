-- CreateTable
CREATE TABLE "analyses" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "emotions" JSONB NOT NULL,
    "sentiment" JSONB NOT NULL,
    "cognitiveDistortions" JSONB NOT NULL,
    "causalLinks" JSONB NOT NULL,
    "keyThemes" JSONB NOT NULL,
    "summary" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patterns" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "frequency" INTEGER NOT NULL DEFAULT 1,
    "relatedEntryIds" JSONB NOT NULL,
    "firstDetected" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastDetected" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patterns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "canvas_nodes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "metadata" JSONB NOT NULL,
    "positionX" DOUBLE PRECISION,
    "positionY" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "canvas_nodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "canvas_edges" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "label" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "canvas_edges_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "analyses_entryId_idx" ON "analyses"("entryId");

-- CreateIndex
CREATE INDEX "analyses_createdAt_idx" ON "analyses"("createdAt");

-- CreateIndex
CREATE INDEX "patterns_userId_idx" ON "patterns"("userId");

-- CreateIndex
CREATE INDEX "patterns_type_idx" ON "patterns"("type");

-- CreateIndex
CREATE INDEX "canvas_nodes_userId_idx" ON "canvas_nodes"("userId");

-- CreateIndex
CREATE INDEX "canvas_nodes_type_idx" ON "canvas_nodes"("type");

-- CreateIndex
CREATE INDEX "canvas_nodes_createdAt_idx" ON "canvas_nodes"("createdAt");

-- CreateIndex
CREATE INDEX "canvas_edges_userId_idx" ON "canvas_edges"("userId");

-- CreateIndex
CREATE INDEX "canvas_edges_sourceId_idx" ON "canvas_edges"("sourceId");

-- CreateIndex
CREATE INDEX "canvas_edges_targetId_idx" ON "canvas_edges"("targetId");

-- CreateIndex
CREATE INDEX "canvas_edges_type_idx" ON "canvas_edges"("type");

-- AddForeignKey
ALTER TABLE "analyses" ADD CONSTRAINT "analyses_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "journal_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patterns" ADD CONSTRAINT "patterns_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "canvas_nodes" ADD CONSTRAINT "canvas_nodes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "canvas_edges" ADD CONSTRAINT "canvas_edges_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
