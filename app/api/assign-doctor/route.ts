import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"// adjust path to your Prisma client

export async function POST(req: Request) {
  try {
    const { testId, doctorId } = await req.json()

    if (!testId) {
      return NextResponse.json(
        { error: "Missing testId" },
        { status: 400 }
      )
    }

    if (!doctorId) {
      // No doctor selected → Delete assignment
      await prisma.testAssignment.deleteMany({
        where: { testId },
      })
      return NextResponse.json({ message: "Doctor unassigned successfully" })
    } else {
      // Doctor selected → Assign or update
      await prisma.testAssignment.upsert({
        where: { testId },
        update: { doctorId },
        create: { testId, doctorId },
      })
      return NextResponse.json({ message: "Doctor assigned successfully" })
    }
  } catch (error) {
    console.error("Error in /api/assign-doctor:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
