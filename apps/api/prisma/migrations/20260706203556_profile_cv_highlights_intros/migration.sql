-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "contactIntro" JSONB,
ADD COLUMN     "cvUrl" TEXT,
ADD COLUMN     "experienceIntro" JSONB,
ADD COLUMN     "highlights" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "projectsIntro" JSONB;
