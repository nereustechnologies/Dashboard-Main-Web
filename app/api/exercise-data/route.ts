import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { exerciseId, testId } = body

    if (!exerciseId || !testId) {
      return NextResponse.json({ error: "Missing exerciseId or testId" }, { status: 400 })
    }

    // First, check if we need to create an exercise record
    let exercise = await prisma.exercise.findFirst({
      where: {
        name: exerciseId,
        testId: testId,
      },
    })

    if (!exercise) {
      // Determine category from exercise ID
      let category = "unknown"
      if (exerciseId.includes("knee") || exerciseId.includes("lunge") || exerciseId.includes("wall")) {
        category = "mobility"
      } else if (exerciseId.includes("squat") || exerciseId.includes("lunges")) {
        category = "strength"
      } else if (exerciseId.includes("plank") || exerciseId.includes("stepUp")) {
        category = "endurance"
      }

      // Create the exercise
      exercise = await prisma.exercise.create({
        data: {
          name: exerciseId,
          category: category,
          testId: testId,
        },
      })
    }
    return NextResponse.json({ success: true, exerciseId: exercise.id }, { status: 200 })
  } catch (error) {
    console.error("Error recording exercise data:", error)
    return NextResponse.json({ error: "An error occurred while recording exercise data" }, { status: 500 })
  }
}

