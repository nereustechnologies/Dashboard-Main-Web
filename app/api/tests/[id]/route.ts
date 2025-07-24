import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: testId } = await params

    const test = await prisma.test.findUnique({
      where: { id: testId },
      include: {
        customer: true,
        tester: { select: { name: true, id: true } }, // Select specific fields from tester
        exercises: true, // Include exercises related to the test
        // ratings: true, // Include ratings if needed
      },
    })

    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 })
    }

    // Authorization: Admins and Doctors can see any test. Testers can only see their own tests.
    if (user.role !== "admin" && user.role !== "doctor" && test.testerId !== user.id && user.role !== "MainDoctor") {
      return NextResponse.json({ error: "Forbidden: You do not have permission to view this test" }, { status: 403 })
    }

    return NextResponse.json({ test })
  } catch (error) {
    console.error("Error fetching test details:", error)
    const errorMessage = error instanceof Error ? error.message : "An internal server error occurred"
    return NextResponse.json({ error: "Failed to fetch test details", details: errorMessage }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify authentication
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const testId = params.id

    // Find the test
    const test = await prisma.test.findUnique({
      where: {
        id: testId,
      },
    })

    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 })
    }

    // Check if this user has permission to delete this test (must be the tester who created it)
    if (test.testerId !== user.id && user.role !== "admin") {
      return NextResponse.json({ error: "You do not have permission to delete this test" }, { status: 403 })
    }


    // Delete the exercises
    await prisma.exercise.deleteMany({
      where: {
        testId: testId,
      },
    })

    // Delete test ratings
    await prisma.testRating.deleteMany({
      where: {
        testId: testId,
      },
    })

    // Delete the test
    await prisma.test.delete({
      where: {
        id: testId,
      },
    })

    return NextResponse.json({ success: true, message: "Test deleted successfully" })
  } catch (error) {
    console.error("Error deleting test:", error)
    return NextResponse.json({ error: "An error occurred while deleting the test" }, { status: 500 })
  }
}

