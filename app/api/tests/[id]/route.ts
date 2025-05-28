import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"
import fs from "fs"

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

