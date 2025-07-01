import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { customerId, section, dropdowns, texts } = await request.json()

    if (!customerId || !section) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 })
    }

    const data = {
      customerId,
      section,
      dropdowns,
      comments: texts,
    }

    const record = await prisma.sectionEvaluation.upsert({
      where: {
        customerId_section: { customerId, section },
      },
      create: data,
      update: {
        dropdowns,
        comments: texts,
      },
    })

    return NextResponse.json({ sectionEvaluation: record })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
} 