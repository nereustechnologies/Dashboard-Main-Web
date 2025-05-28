import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const admin = await verifyAuth(request)
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is an admin
    if (admin.role !== "admin") {
      return NextResponse.json({ error: "Only admins can access this endpoint" }, { status: 403 })
    }

    // Get all testers created by this admin
    const testers = await prisma.user.findMany({
      where: {
        role: "tester",
        adminId: admin.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        adminId: true,
        // Include test statistics
        _count: {
          select: {
            tests: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Format the response with additional calculated fields
    const formattedTesters = await Promise.all(
      testers.map(async (tester) => {
        // Get the last test date for this tester
        const lastTest = await prisma.test.findFirst({
          where: {
            testerId: tester.id,
          },
          orderBy: {
            createdAt: "desc",
          },
          select: {
            createdAt: true,
          },
        })

        return {
          id: tester.id,
          name: tester.name,
          email: tester.email,
          testsCompleted: tester._count.tests,
          lastActive: lastTest ? lastTest.createdAt.toISOString().split("T")[0] : "Never",
          adminId: tester.adminId,
        }
      }),
    )

    return NextResponse.json({ success: true, testers: formattedTesters })
  } catch (error) {
    console.error("Error fetching testers:", error)
    return NextResponse.json({ error: "An error occurred while fetching testers" }, { status: 500 })
  }
}

