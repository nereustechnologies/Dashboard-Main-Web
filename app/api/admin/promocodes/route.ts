import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Update path if needed
import { PrismaClient, DiscountType } from "@prisma/client"


// GET: List all promocodes


export async function GET() {
  try {
    const promoCodes = await prisma.promoCode.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(promoCodes);
  } catch (error) {
    console.error("Error fetching promo codes:", error);
    return NextResponse.json({ error: "Failed to fetch promo codes" }, { status: 500 });
  }
}

// POST: Add a new promocode
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      code,
      discountType,
      discountValue,
      usageLimit,
      expiryDate,
    } = body;

    console.log(body.discountType)

const upperDiscountType = discountType as keyof typeof DiscountType

if (!upperDiscountType || !DiscountType[upperDiscountType]) {
  return Response.json({ error: "Invalid discount type" }, { status: 400 })
}

const newPromo = await prisma.promoCode.create({
  data: {
    code,
    discountType: DiscountType[upperDiscountType],
    discountValue,
    usageLimit,
    expiryDate: new Date(expiryDate),
  },
})

    return NextResponse.json(newPromo);
  } catch (error) {
    console.error("Error creating promocode:", error);
    return NextResponse.json({ error: "Failed to create promocode" }, { status: 500 });
  }
}

// DELETE: Delete a promocode by ID
export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { id } = body;

    await prisma.promoCode.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting promocode:", error);
    return NextResponse.json({ error: "Failed to delete promocode" }, { status: 500 });
  }
}
