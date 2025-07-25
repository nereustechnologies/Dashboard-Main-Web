import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth"; // Your utility to verify JWT and get user details

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request); // This should return user object with id and role

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let tests;

  if (user.role === "admin" || user.role === "MainDoctor") {
  tests = await prisma.test.findMany({
    include: {
      customer: true,
      tester: { select: { name: true, id: true } },
      exercises: { select: { category: true } },
      AssignedTo: {
        include: {
          doctor: {
            select: { id: true, name: true, email: true },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

    else if (user.role === "doctor") {
  // Fetch assigned tests using TestAssignment table
  const assignedTests = await prisma.testAssignment.findMany({
    where: {
      doctorId: user.id,
    },
    include: {
      test: {
        include: {
          customer: true,
          tester: { select: { name: true, id: true } },
          exercises: { select: { category: true } },
        },
      },
    },
    orderBy: {
      assignedAt: "desc", // or test.createdAt, but this works from TestAssignment
    },
  });

  // Map to just the test objects
  tests = assignedTests.map((assignment) => assignment.test);
}
     else if (user.role === "tester") {
      // Testers can only see their own tests
      tests = await prisma.test.findMany({
        where: {
          testerId: user.id,
        },
        include: {
          customer: true,
          tester: { select: { name: true, id: true } },
          exercises: { select: { category: true } },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } else {
      // Other roles (if any) are not permitted to see this list by default
      return NextResponse.json({ error: "Forbidden: Insufficient permissions" }, { status: 403 });
    }

    return NextResponse.json({ tests });
  } catch (error) {
    console.error("Error fetching tests:", error);
    const errorMessage = error instanceof Error ? error.message : "An internal server error occurred";
    return NextResponse.json({ error: "Failed to fetch tests", details: errorMessage }, { status: 500 });
  }
}

// You might also have a POST handler here for creating tests, ensure its authorization is correct.
// export async function POST(request: NextRequest) { /* ... */ }

