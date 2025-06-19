import { NextRequest, NextResponse } from "next/server"
import prisma from "../../../../lib/prisma" // ✅ importing the instance directly
import { verifyAuth } from "@/lib/auth"


export async function POST(request: NextRequest) {
  try {

      const user = await verifyAuth(request)
        if (!user) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
    
    const body = await request.json()
    const { uniqueId } = body

    if (!uniqueId) {
      return NextResponse.json({ error: "Missing uniqueId in request body" }, { status: 400 })
    }

    const client = await prisma.client.findUnique({
      where: { uniqueId },
      select: {
        id: true,
        fullName: true,
        age: true,
        gender: true,
      },
    })

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    return NextResponse.json({
      id: client.id,
      name: client.fullName,
      age: client.age,
      gender: client.gender,
    })
  } catch (error) {
    console.error("Error fetching client info:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
