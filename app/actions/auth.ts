"use server"

import { cookies } from "next/headers"

// Mock users for demonstration
const mockUsers = {
  testers: [
    { id: "1", name: "John Smith", email: "john@example.com", password: "password", role: "tester" },
    { id: "2", name: "Sarah Johnson", email: "sarah@example.com", password: "password", role: "tester" },
  ],
  admins: [{ id: "1", name: "Admin User", email: "admin@example.com", password: "password", role: "admin" }],
}

export async function login(email: string, password: string, userType: string) {
  try {
    // Find user based on userType and credentials
    let user
    if (userType === "admin") {
      user = mockUsers.admins.find((u) => u.email === email && u.password === password)
    } else {
      user = mockUsers.testers.find((u) => u.email === email && u.password === password)
    }

    if (!user) {
      return { success: false, error: "Invalid email or password" }
    }

    // In a real app, you would generate a JWT token here
    const token = "mock_token_" + Math.random().toString(36).substring(2)

    // Set cookies
    cookies().set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    })

    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    }
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, error: "An error occurred during login" }
  }
}

