import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"
import fs from "fs"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify authentication
    const admin = await verifyAuth(request)
   

   

    const { id: testId } = await params
    // Get the test with all related data
    const test = await prisma.test.findUnique({
      where: {
        id: testId,
      },
      include: {
        customer: true,
        tester: {
          select: {
            id: true,
            name: true,
            email: true,
            adminId: true,
          },
        },
        exercises: {
         
        },
        ratings: true,
      },
    })

    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 })
    }

    // Check if the test belongs to a tester managed by this admin
   

    return NextResponse.json({ success: true, test })
  } catch (error) {
    console.error("Error fetching test details:", error)
    return NextResponse.json({ error: "An error occurred while fetching test details" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify authentication
    const admin = await verifyAuth(request)
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is an admin
    if (admin.role !== "admin") {
      return NextResponse.json({ error: "Only admins can delete tests" }, { status: 403 })
    }

    const testId = params.id

    // Find the test
    const test = await prisma.test.findUnique({
      where: {
        id: testId,
      },
      include: {
        tester: true,
      },
    })

    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 })
    }

    // Check if the test belongs to a tester managed by this admin
    if (test.tester.adminId !== admin.id) {
      return NextResponse.json({ error: "You can only delete tests from testers you manage" }, { status: 403 })
    }

    // Find the associated zip file to delete it
    const zipFile = await prisma.zipFile.findFirst({
      where: {
        testId: testId,
      },
    })

    // Delete the zip file from disk if it exists
    if (zipFile && fs.existsSync(zipFile.filePath)) {
      fs.unlinkSync(zipFile.filePath)
    }

    // Delete the zip file record from the database
    if (zipFile) {
      await prisma.zipFile.delete({
        where: {
          id: zipFile.id,
        },
      })
    }

    // Delete the test's related data
    // First delete exercise data (if any)
    await prisma.exerciseData.deleteMany({
      where: {
        exercise: {
          testId: testId,
        },
      },
    })

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

