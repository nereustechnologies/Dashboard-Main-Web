import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"

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

    // Prefer the first asset file that has analysisResults or processed path
    const preferredFile = exercise.assetFiles.find((f) => f.analysisResults || f.s3PathProcessed) || exercise.assetFiles[0]

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

    if (!preferredFile) {
      return NextResponse.json({ error: "No asset file found for this exercise to update" }, { status: 404 })
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
