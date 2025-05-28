import type { NextRequest } from "next/server"
import { verify } from "jsonwebtoken"
import prisma from "./prisma"

export async function verifyAuth(request: NextRequest) {
  try {
    // First try to get token from Authorization header
    let token = null
    const authHeader = request.headers.get("Authorization")
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1]
    }

    // If no token in header, check query params
    if (!token) {
      const url = new URL(request.url)
      token = url.searchParams.get("token")
    }

    if (!token) {
      return null
    }

    // Verify the token
    const decoded = verify(token, process.env.JWT_SECRET || "your_jwt_secret_key") as {
      id: string
      email: string
      role: string
    }

    // Get the user from the database
    const user = await prisma.user.findUnique({
      where: {
        id: decoded.id,
      },
    })

    if (!user) {
      return null
    }

    return user
  } catch (error) {
    console.error("Auth verification error:", error)
    return null
  }
}

