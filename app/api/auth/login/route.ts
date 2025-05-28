import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { sign } from "jsonwebtoken"
import { compare } from "bcrypt"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Find the user
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // For testers, verify they were created by an admin
    if (user.role === "tester" && !user.adminId) {
      return NextResponse.json({ error: "Unauthorized tester account" }, { status: 403 })
    }

    // Compare passwords using bcrypt
    let passwordMatch = false
    try {
      passwordMatch = await compare(password, user.password)
    } catch (e) {
      // If bcrypt comparison fails (e.g., password not hashed), fall back to direct comparison
      // This is for backward compatibility with existing accounts
      passwordMatch = user.password === password
    }

    if (!passwordMatch) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Create JWT token
    const token = sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || "your_jwt_secret_key",
      { expiresIn: "1d" },
    )

    // Return user info and token
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      token,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "An error occurred during login" }, { status: 500 })
  }
}

