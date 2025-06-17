-- AlterTable
ALTER TABLE "ExerciseAssetFile" ADD COLUMN     "analysisResults" JSONB;

-- AlterTable
ALTER TABLE "SectionEvaluation" ADD COLUMN     "textLabels" JSONB;
