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
    const { customerId } = body

    if (!customerId) {
      return NextResponse.json({ error: "Customer ID is required" }, { status: 400 })
    }

    const newTest = await prisma.test.create({
      data: {
        customerId: customerId,
        testerId: user.id,
        status: "In Progress",
      },
    })

    return NextResponse.json(newTest, { status: 201 })
  } catch (error) {
    console.error("Error creating test:", error)
    return NextResponse.json({ error: "An error occurred while creating a new test" }, { status: 500 })
  }
} 