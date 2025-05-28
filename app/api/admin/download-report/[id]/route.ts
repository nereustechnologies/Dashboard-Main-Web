import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import fs from "fs"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get token from query parameter if provided (for direct downloads)
    const url = new URL(request.url)
    const tokenFromQuery = url.searchParams.get("token")

    // Get token from Authorization header
    const authHeader = request.headers.get("Authorization")
    const tokenFromHeader = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null

    // Use token from query or header
    const token = tokenFromQuery || tokenFromHeader

    if (!token) {
      return new NextResponse("Unauthorized: No token provided", { status: 401 })
    }

    // Manually verify the token
    try {
      const jwt = require("jsonwebtoken")
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret_key")

      if (!decoded || !decoded.id) {
        return new NextResponse("Unauthorized: Invalid token", { status: 401 })
      }

      // Get user from database to verify they exist
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      })

      if (!user) {
        return new NextResponse("Unauthorized: User not found", { status: 401 })
      }

      // Check if user is an admin
      if (user.role !== "admin") {
        return new NextResponse("Only admins can access this endpoint", { status: 403 })
      }

      // Continue with the existing logic...
      const testId = params.id

      // Find the test
      const test = await prisma.test.findUnique({
        where: {
          id: testId,
        },
        include: {
          tester: true,
          customer: true,
        },
      })

      if (!test) {
        return new NextResponse("Test not found", { status: 404 })
      }

      // Check if the tester belongs to this admin
      if (test.tester.adminId !== user.id) {
        return new NextResponse("You can only download tests from testers you manage", { status: 403 })
      }

      // Find the associated zip file
      const zipFile = await prisma.zipFile.findFirst({
        where: {
          testId: testId,
        },
      })

      if (!zipFile) {
        // If no zip file exists with testId, try to find by customerId
        const zipFiles = await prisma.zipFile.findMany({
          where: {
            customerId: test.customerId,
            testerId: test.testerId,
          },
          orderBy: {
            createdAt: "desc",
          },
        })

        if (zipFiles.length > 0) {
          // Use the most recent zip file
          const filePath = zipFiles[0].filePath

          if (fs.existsSync(filePath)) {
            // Read the file
            const fileBuffer = fs.readFileSync(filePath)

            // Create a response with the file
            const response = new NextResponse(fileBuffer)

            // Set the appropriate headers
            response.headers.set("Content-Type", "application/zip")
            response.headers.set("Content-Disposition", `attachment; filename="${zipFiles[0].filename}"`)

            return response
          }
        }

        return new NextResponse("Zip file not found", { status: 404 })
      }

      // Check if the file exists
      if (!fs.existsSync(zipFile.filePath)) {
        return new NextResponse("Zip file not found on server", { status: 404 })
      }

      // Read the file
      const fileBuffer = fs.readFileSync(zipFile.filePath)

      // Create a response with the file
      const response = new NextResponse(fileBuffer)

      // Set the appropriate headers
      response.headers.set("Content-Type", "application/zip")
      response.headers.set("Content-Disposition", `attachment; filename="${zipFile.filename}"`)

      return response
    } catch (jwtError) {
      console.error("JWT verification error:", jwtError)
      return new NextResponse("Unauthorized: Invalid token", { status: 401 })
    }
  } catch (error) {
    console.error("Error downloading report:", error)
    return new NextResponse(`Error downloading report: ${error instanceof Error ? error.message : "Unknown error"}`, {
      status: 500,
    })
  }
}

