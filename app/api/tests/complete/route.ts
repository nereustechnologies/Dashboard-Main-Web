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
    const { testId } = body

    if (!testId) {
      return NextResponse.json({ error: "Test ID is required" }, { status: 400 })
    }

    // Update test status to "Completed"
    const updatedTest = await prisma.test.update({
      where: { id: testId },
      data: { status: "Completed" },
    })

    // Mark all exercises for this test as completed
    await prisma.exercise.updateMany({
      where: { testId: testId },
      data: { completed: true },
    })

    return NextResponse.json({ message: "Test completed successfully", test: updatedTest }, { status: 200 })
  } catch (error) {
    console.error("Error completing test:", error)
    const errorMessage = error instanceof Error ? error.message : "An error occurred"
    return NextResponse.json({ error: "Failed to complete test", details: errorMessage }, { status: 500 })
  }
} 