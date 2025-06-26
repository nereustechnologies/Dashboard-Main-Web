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
