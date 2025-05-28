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

    // Get all tests from testers managed by this admin
    const tests = await prisma.test.findMany({
      where: {
        tester: {
          adminId: admin.id,
        },
      },
      include: {
        customer: true,
        tester: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        exercises: true,
        ratings: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Format the response
    const reports = tests.map((test) => ({
      id: test.id,
      date: test.createdAt.toISOString().split("T")[0],
      customerName: test.customer.name,
      testerId: test.tester.id,
      testerName: test.tester.name,
      categories: test.exercises
        .map((ex) => ex.category)
        .filter((v, i, a) => a.indexOf(v) === i)
        .map((category) => category.charAt(0).toUpperCase() + category.slice(1)),
      status: test.status,
      ratings: test.ratings,
    }))

    return NextResponse.json({ success: true, reports })
  } catch (error) {
    console.error("Error fetching reports:", error)
    return NextResponse.json({ error: "An error occurred while fetching reports" }, { status: 500 })
  }
}

