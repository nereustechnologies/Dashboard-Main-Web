import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { exerciseId, action, timestamp, leg, customerId } = body

    // In a real app, this would save the data to a CSV file and/or database
    console.log(`Recording: Exercise ${exerciseId}, Action: ${action}, Time: ${timestamp}, Leg: ${leg || "N/A"}`)

    // Mock response
    return NextResponse.json({
      success: true,
      message: "Data recorded successfully",
      data: { exerciseId, action, timestamp, leg, customerId },
    })
  } catch (error) {
    console.error("Error recording exercise data:", error)
    return NextResponse.json({ error: "Failed to record data" }, { status: 500 })
  }
}

