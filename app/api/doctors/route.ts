import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma" // adjust this path if your prisma client is elsewhere

export async function GET() {
  try {
    const doctors = await prisma.user.findMany({
      where: { role: "doctor" },
      select: {
        id: true,
        name: true,
        email: true,
      },
    })

    return NextResponse.json(doctors)
  } catch (error) {
    console.error("Failed to fetch doctors:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
