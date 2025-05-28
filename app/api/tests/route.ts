import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all tests for this tester
    const tests = await prisma.test.findMany({
      where: {
        testerId: user.id,
      },
      include: {
        customer: true,
        exercises: true,
        ratings: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ success: true, tests })
  } catch (error) {
    console.error("Error fetching tests:", error)
    return NextResponse.json({ error: "An error occurred while fetching tests" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { customerId, exercises, ratings, zipFileId } = body

    // Create the test
    const test = await prisma.test.create({
      data: {
        status: "Completed",
        customer: {
          connect: {
            id: customerId,
          },
        },
        tester: {
          connect: {
            id: user.id,
          },
        },
        exercises: {
          create: exercises.map((exercise: any) => ({
            name: exercise.name,
            category: exercise.category,
            completed: exercise.completed,
          })),
        },
        ratings: {
          create: {
            overall: ratings.overall,
            mobility: ratings.mobility,
            strength: ratings.strength,
            endurance: ratings.endurance,
            feedback: ratings.feedback,
            customerFeedback: ratings.customerFeedback,
          },
        },
      },
      include: {
        exercises: true,
        ratings: true,
        customer: true,
      },
    })

    // If zipFileId was provided, associate it with this test
    if (zipFileId) {
      await prisma.zipFile.update({
        where: {
          id: zipFileId,
        },
        data: {
          testId: test.id,
        },
      })
    }

    return NextResponse.json({ success: true, test })
  } catch (error) {
    console.error("Error creating test:", error)
    return NextResponse.json({ error: "An error occurred while creating the test" }, { status: 500 })
  }
}

