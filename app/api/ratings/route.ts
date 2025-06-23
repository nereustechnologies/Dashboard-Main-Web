import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { testId, ratings } = body

    if (!testId || !ratings) {
      return NextResponse.json({ error: "Missing testId or ratings" }, { status: 400 })
    }

    // Check if a rating for this test already exists
    const existingRating = await prisma.testRating.findUnique({
      where: { testId },
    })

    if (existingRating) {
      return NextResponse.json(
        { error: "Ratings for this test have already been submitted." },
        { status: 409 }
      )
    }

    const newRating = await prisma.testRating.create({
      data: {
        testId,
        overall: ratings.overall,
        mobility: ratings.mobility,
        strength: ratings.strength,
        endurance: ratings.endurance,
        observation: ratings.observation,
        RPE: ratings.RPE,
        FeltAfterWorkOut: ratings.FeltAfterWorkOut,
      },
    })

    return NextResponse.json(newRating, { status: 201 })
  } catch (error) {
    console.error("❌ Error submitting rating:", error)
    return NextResponse.json(
      { error: "An error occurred while submitting the rating" },
      { status: 500 }
    )
  }
}
