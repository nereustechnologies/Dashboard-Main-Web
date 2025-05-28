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
    const { exerciseId, timestamp, action, leg, customerId } = body

    // First, check if we need to create an exercise record
    let exercise = await prisma.exercise.findFirst({
      where: {
        name: exerciseId,
      },
    })

    if (!exercise) {
      // Determine category from exercise ID
      let category = "unknown"
      if (exerciseId.includes("knee") || exerciseId.includes("lunge") || exerciseId.includes("wall")) {
        category = "mobility"
      } else if (exerciseId.includes("squat") || exerciseId.includes("lunges")) {
        category = "strength"
      } else if (exerciseId.includes("plank") || exerciseId.includes("sprint") || exerciseId.includes("shuttle")) {
        category = "endurance"
      }

      // Find or create a test for this customer
      let test = await prisma.test.findFirst({
        where: {
          customerId: customerId,
          testerId: user.id,
          status: "In Progress",
        },
      })

      if (!test) {
        // Create a new test
        test = await prisma.test.create({
          data: {
            customerId: customerId,
            testerId: user.id,
            status: "In Progress",
          },
        })
      }

      // Create the exercise
      exercise = await prisma.exercise.create({
        data: {
          name: exerciseId,
          category: category,
          testId: test.id,
        },
      })
    }

    // Now create the exercise data
    const exerciseData = await prisma.exerciseData.create({
      data: {
        timestamp,
        action,
        leg: leg || "N/A",
        exerciseId: exercise.id,
      },
    })

    return NextResponse.json({ success: true, exerciseData }, { status: 201 })
  } catch (error) {
    console.error("Error recording exercise data:", error)
    return NextResponse.json({ error: "An error occurred while recording exercise data" }, { status: 500 })
  }
}

