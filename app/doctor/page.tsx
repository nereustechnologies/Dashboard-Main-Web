// filepath: x:\Partnership work\Nerues\newcode2\app\doctor\page.tsx
"use client"

import TestsList from "@/components/tests-list" // Import the new component
import Image from "next/image" // Assuming you might want a logo or similar
// You might need a logout button or other doctor-specific UI elements
// import { Button } from "@/components/ui/button"
// import { useRouter } from "next/navigation"
// import { useEffect, useState } from "react"

export default function DoctorDashboardPage() {
  // const router = useRouter()
  // Add any specific logic for the doctor's dashboard here,
  // like fetching doctor-specific info or handling doctor logout.

  // const handleLogout = () => {
  //   // Implement doctor logout logic
  //   localStorage.removeItem("doctorToken"); // Example
  //   router.push("/doctor/login"); // Or appropriate login page
  // };

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="container mx-auto max-w-6xl">
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* You can add a logo similar to the tester dashboard if you like */}
            <Image src="/logo.svg" alt="Nereus Technologies Logo" width={40} height={45} />
            <div>
              <h1 className="text-2xl font-bold text-[#00D4EF]">Doctor Dashboard</h1>
              {/* You might want to display the doctor's name here */}
              <p className="text-gray-400">Review patient test results.</p>
            </div>
          </div>
          {/* Add a logout button or other actions if needed */}
          {/* <Button variant="outline" onClick={handleLogout} className="border-[#00D4EF] text-[#00D4EF]">
            Logout
          </Button> */}
        </header>

        <TestsList /> {/* Use the new component here */}

      </div>
    </div>
  )
}