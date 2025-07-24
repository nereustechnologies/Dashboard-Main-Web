import { NextRequest, NextResponse } from "next/server"
import { verify } from "jsonwebtoken"
import { prisma } from "@/lib/prisma" // Adjust path if needed

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized: No token" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]

    // Verify token
    const decoded = verify(token, process.env.JWT_SECRET || "your_jwt_secret_key") as {
      id: string
      email: string
      role: string
    }

    // Optional: Prevent access to others’ data
    // if (decoded.id !== body.doctorId) {
    //   return NextResponse.json({ error: "Unauthorized: ID mismatch" }, { status: 403 })
    // }

const assignments = await prisma.testAssignment.findMany({
  where: {
    doctorId: body.doctorId,
  },
  include: {
    test: {
      include: {
        customer: true, // include related customer data
        tester: true,   // include related tester data (assuming it's a User or similar model)
      },
    },
  },
})


    console.log(assignments)
    return NextResponse.json({ tests: assignments }, { status: 200 })

  } catch (err) {
    console.error("Error in POST /api/DoctorInfo:", err)
    return NextResponse.json({ error: "Internal Server Error or Invalid Token" }, { status: 500 })
  }
}
