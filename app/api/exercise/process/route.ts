import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Helper to convert exercise names like "Knee Flexion" → "knee_flexion"
function slugify(text: string) {
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_") // Replace spaces with underscore to match folder convention
    .replace(/[^\w_]+/g, "") // Remove non-word chars except underscore
}

export async function POST(request: Request) {
  try {
    const { customerId, testId, exerciseName } = await request.json()

    if (!customerId || !testId || !exerciseName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const exerciseSlug = slugify(exerciseName) // e.g. knee_flexion
    const bucket = "neureusbucketproto"
    const s3Prefix = `${customerId}/${testId}/${exerciseSlug}`

    // Call the AWS API Gateway endpoint specific to the exercise
    const awsUrl = `https://91uqh2n4kb.execute-api.us-east-1.amazonaws.com/v1/${exerciseSlug}`

    const awsResp = await fetch(awsUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ bucket, s3Prefix }),
    })

    if (!awsResp.ok) {
      const err = await awsResp.text()
      console.error("AWS processing failed:", err)
      return NextResponse.json({ error: "AWS processing failed", details: err }, { status: 502 })
    }

    const awsData = await awsResp.json() // e.g. { status: "success", output_key: ".../calculated_angles.csv", ... }

    // Find the Exercise record (unique by test & name)
    const exercise = await prisma.exercise.findFirst({
      where: { testId, name: exerciseName },
    })

    if (!exercise) {
      return NextResponse.json({ error: "Exercise not found" }, { status: 404 })
    }

    // Create new ExerciseAssetFile for processed result
    const processedAsset = await prisma.exerciseAssetFile.create({
      data: {
        exerciseId: exercise.id,
        fileName: awsData.output_key?.split("/").pop() || "processed_output.csv",
        fileType: `processed_result`,
        s3PathRaw: s3Prefix, // original folder
        s3PathProcessed: awsData.output_key || null,
        analysisResults: awsData, // store everything else (including output_key etc.)
        status: awsData.status || "processed",
      } as any,
    })

    return NextResponse.json({ success: true, processedAsset })
  } catch (error) {
    console.error("Error in exercise processing route:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
} 