import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"
import { startOfDay, endOfDay } from 'date-fns'





export async function GET(req: NextRequest) {
  try {
    const dates = await prisma.slotDate.findMany({
      select: {
        id: true,
        date: true,
        price: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    return NextResponse.json(dates);
  } catch (err) {
    console.error("Failed to fetch slot dates:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}


export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { date, price } = body

    

    if (!date || price == null) {
      return NextResponse.json({ error: "Missing date or price" }, { status: 400 })
    }

    const parsedDate = new Date(date)
const start = startOfDay(parsedDate)
const end = endOfDay(parsedDate)
   

const updatedSlot = await prisma.slotDate.updateMany({
  where: {
    date: {
      gte: start,
      lte: end,
    },
  },
  data: {
    price: price,
  },
})
    if (updatedSlot.count === 0) {
      return NextResponse.json({ error: "No slot for that day available" }, { status: 404 })
    }

    return NextResponse.json({ message: "Price updated successfully", updatedCount: updatedSlot.count })
  } catch (err) {
    console.error("Failed to update slot price:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}