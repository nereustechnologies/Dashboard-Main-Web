import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { customerId, scores } = body

    if (!customerId || !Array.isArray(scores)) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    }

    const existingScores = await prisma.scoresToBeat.findMany({
      where: { customerId },
    })

    const incomingTitles = scores.map((s: any) => s.title).filter(Boolean)

    // 1️⃣ Delete scores that are no longer in the incoming list
    const titlesToDelete = existingScores
      .filter((s) => !incomingTitles.includes(s.title))
      .map((s) => s.title)

    if (titlesToDelete.length > 0) {
      await prisma.scoresToBeat.deleteMany({
        where: {
          customerId,
          title: { in: titlesToDelete },
        },
      })
    }

    // 2️⃣ Upsert (update/create) incoming scores
    const results = []
    for (const entry of scores) {
      const { title, current, target } = entry
      if (!title || current === undefined || target === undefined) continue

      const score = await prisma.scoresToBeat.upsert({
        where: {
          customerId_title: { customerId, title },
        },
        update: { current, best: target },
        create: { customerId, title, current, best: target },
      })

      results.push(score)
    }

    return NextResponse.json({ message: "Scores saved", data: results }, { status: 200 })

  } catch (error) {
    console.error("Error saving scores:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const customerId = searchParams.get("customerId")

    if (!customerId) {
      return NextResponse.json({ error: "Missing customerId" }, { status: 400 })
    }

    const scores = await prisma.scoresToBeat.findMany({
      where: { customerId },
    })

    return NextResponse.json({ data: scores }, { status: 200 })
  } catch (err) {
    console.error("Failed to fetch scores:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
