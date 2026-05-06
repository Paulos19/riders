-- AlterTable
ALTER TABLE "Route" ADD COLUMN     "difficulty" TEXT NOT NULL DEFAULT 'Médio',
ADD COLUMN     "path" JSONB,
ADD COLUMN     "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "ratingCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emergencyName" TEXT,
ADD COLUMN     "emergencyPhone" TEXT;
