import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, age, gender, height, weight, sleepLevels, activityLevel, calorieIntake, mood,uniqueId } = body

    console.log(uniqueId);

    // Create the customer
    const customer = await prisma.customer.create({
      data: {
        UniqueId:uniqueId,
        name,
        age,
        gender,
        height,
        weight,
        sleepLevels,
        activityLevel,
        calorieIntake,
        mood,
      },
    })

    return NextResponse.json({ success: true, customer }, { status: 201 })
  } catch (error) {
    console.error("Error creating customer:", error)
    return NextResponse.json({ error: "An error occurred while creating the customer" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all customers
    const customers = await prisma.customer.findMany({
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ success: true, customers })
  } catch (error) {
    console.error("Error fetching customers:", error)
    return NextResponse.json({ error: "An error occurred while fetching customers" }, { status: 500 })
  }
}

