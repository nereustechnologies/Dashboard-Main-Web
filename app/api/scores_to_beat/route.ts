import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { customerId, scores } = body

    if (!customerId || !Array.isArray(scores)) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    }

    const results = []

    for (const entry of scores) {
      const { title, current, target } = entry

      if (!title || current === undefined || target === undefined) {
        continue // skip incomplete entries
      }

      const currentInt = parseInt(current)
      const targetInt = parseInt(target)

      if (isNaN(currentInt) || isNaN(targetInt)) {
        continue // skip invalid scores
      }

      const score = await prisma.scoresToBeat.upsert({
        where: {
          customerId_title: {
            customerId,
            title,
          },
        },
        update: {
          current: currentInt,
          best: targetInt,
        },
        create: {
          customerId,
          title,
          current: currentInt,
          best: targetInt,
        },
      })

      results.push(score)
    }

    return NextResponse.json({ message: "Scores saved", data: results }, { status: 200 })
  } catch (error) {
    console.error("Error saving scores:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
