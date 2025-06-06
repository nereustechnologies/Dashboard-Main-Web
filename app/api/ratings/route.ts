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
      where: { testId: testId },
    })

    if (existingRating) {
      // Optionally, you can either update the existing rating or return an error
      // For now, let's return an error to prevent duplicates
      return NextResponse.json({ error: "Ratings for this test have already been submitted." }, { status: 409 })
    }

    const newRating = await prisma.testRating.create({
      data: {
        testId: testId,
        overall: ratings.overall,
        mobility: ratings.mobility,
        strength: ratings.strength,
        endurance: ratings.endurance,
        feedback: ratings.feedback,
        customerFeedback: ratings.customerFeedback,
      },
    })

    return NextResponse.json(newRating, { status: 201 })
  } catch (error) {
    console.error("Error submitting rating:", error)
    return NextResponse.json({ error: "An error occurred while submitting the rating" }, { status: 500 })
  }
} 