import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"

function slugify(text: string) {
  if(text=="stepUp"){
    return text
  }
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_") // Replace spaces with underscore to match folder convention
    .replace(/[^\w_]+/g, "") // Remove non-word chars except underscore
}

// Helper to convert exercise names like "Knee Flexion" → "knee-flexion" for AWS URLs
function awsSlugify(text: string) {
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-") // Replace spaces and underscores with hyphen for AWS URLs
    .replace(/[^\w-]+/g, "") // Remove non-word chars except hyphen
}


export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Optional: require authentication – adjust as needed
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    

    const exercise = await prisma.exercise.findUnique({
      where: { id },
      include: { assetFiles: true },
    })

    if (!exercise) {
      return NextResponse.json({ error: "Exercise not found" }, { status: 404 })
    }

   const sortedFiles = [...exercise.assetFiles].sort((a, b) => {
  return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
})

// Prefer the latest file that has analysisResults or s3PathProcessed
const preferredFile = sortedFiles.find(f => f.analysisResults || f.s3PathProcessed) || sortedFiles[0]

const analysisResults = preferredFile?.analysisResults ?? null
const s3PathProcessed = preferredFile?.s3PathProcessed ?? null
    return NextResponse.json({ analysisResults, s3PathProcessed })
  } catch (error) {
    console.error("Error fetching exercise analysis:", error)
    return NextResponse.json({ error: "Failed to fetch exercise analysis" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    const { metrics } = await request.json()

    if (!metrics) {
      return NextResponse.json({ error: "Metrics data is required" }, { status: 400 })
    }

    const exercise = await prisma.exercise.findUnique({
      where: { id },
      include: { assetFiles: { orderBy: { createdAt: "desc" } } },
    })

    if (!exercise) {
      return NextResponse.json({ error: "Exercise not found" }, { status: 404 })
    }

    const preferredFile = exercise.assetFiles.find((f) => f.analysisResults || f.s3PathProcessed) || exercise.assetFiles[0]

    let assetFile = preferredFile;

if (!assetFile) {
  const exerciseSlug = slugify(exercise.name);
  const s3PathRaw = `${exercise.testId}/${exercise.id}/${exerciseSlug}/`;

  assetFile = await prisma.exerciseAssetFile.create({
    data: {
      exerciseId: exercise.id,
      fileName: "processed_output.csv",       // Keep consistent
      fileType: "processed_result",           // Same as AWS-processed files
      s3PathRaw,
      s3PathProcessed: null,                  // Because no file is being uploaded
      analysisResults: {
        body: JSON.stringify(metrics),        // Store manually patched data
      },
      status: "manual",                       // To distinguish from AWS-processed ones
    },
  });

  return NextResponse.json({
    message: "New asset created and metrics saved",
    created: true,
  });
}

    const currentAnalysis = (preferredFile.analysisResults ?? { body: "{}" }) as any

    const newAnalysisBody = JSON.stringify(metrics)
    const newAnalysisResults = { ...currentAnalysis, body: newAnalysisBody }

    await prisma.exerciseAssetFile.update({
      where: { id: preferredFile.id },
      data: {
        analysisResults: newAnalysisResults,
      },
    })

    return NextResponse.json({ message: "Metrics updated successfully" })
  } catch (error) {
    console.error("Error updating exercise analysis:", error)
    return NextResponse.json({ error: "Failed to update metrics" }, { status: 500 })
  }
} 
