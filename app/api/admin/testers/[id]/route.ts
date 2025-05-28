import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify authentication
    const admin = await verifyAuth(request)
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is an admin
    if (admin.role !== "admin") {
      return NextResponse.json({ error: "Only admins can access tester details" }, { status: 403 })
    }

    const testerId = params.id

    // Check if tester exists and belongs to this admin
    const tester = await prisma.user.findUnique({
      where: {
        id: testerId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        adminId: true,
      },
    })

    if (!tester) {
      return NextResponse.json({ error: "Tester not found" }, { status: 404 })
    }

    if (tester.adminId !== admin.id) {
      return NextResponse.json({ error: "You can only view testers you created" }, { status: 403 })
    }

    // Get tester's tests
    const tests = await prisma.test.findMany({
      where: {
        testerId: testerId,
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

    return NextResponse.json({
      success: true,
      tester,
      tests,
      stats: {
        totalTests: tests.length,
        completedTests: tests.filter((test) => test.status === "Completed").length,
        averageRating:
          tests.reduce((sum, test) => sum + (test.ratings?.overall || 0), 0) /
          (tests.filter((test) => test.ratings).length || 1),
      },
    })
  } catch (error) {
    console.error("Error fetching tester details:", error)
    return NextResponse.json({ error: "An error occurred while fetching tester details" }, { status: 500 })
  }
}

