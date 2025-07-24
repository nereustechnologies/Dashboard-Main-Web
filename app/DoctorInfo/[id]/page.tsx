"use client"

import { useEffect, useState } from "react"

type Test = {
  id: string
  status: string
  date: string
  customer: { name: string }
  tester: { name: string }
}

type Doctor = {
  id: string
  name: string
  email: string
  role: string
}

export default function DoctorPageClient({ id }: { id: string }) {
  const [assignedTests, setAssignedTests] = useState<Test[]>([])
  const [doctor, setDoctor] = useState<Doctor | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token")
      const res = await fetch(`/api/DoctorInfo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ doctorId: id }),
      })

      const data = await res.json()
      setAssignedTests(data.tests)
      setDoctor(data.doctor)
    }

    fetchData()
  }, [id])

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Doctor Info */}
      {doctor && (
        <div className="bg-white rounded-2xl shadow p-6 mb-6 border border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Dr. {doctor.name}
          </h1>
          <p className="text-gray-600">Email: {doctor.email}</p>
          <p className="text-gray-600">Role: {doctor.role}</p>
        </div>
      )}

      {/* Stats */}
      <div className="mb-4 text-lg font-semibold">
        Total Tests Assigned:{" "}
        <span className="text-blue-600">{assignedTests.length}</span>
      </div>

      {/* Test Cards */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {assignedTests.map((test) => (
          <div
            key={test.id}
            className="bg-white rounded-2xl shadow p-5 border border-gray-100 hover:shadow-md transition"
          >
            <div className="text-sm text-gray-500 mb-1">
              Test Date: {new Date(test.date).toLocaleDateString()}
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              Status: {test.status}
            </h3>
            <p className="text-gray-700 mt-2">
              Customer:{" "}
              <span className="font-medium">{test.customer?.name}</span>
            </p>
            <p className="text-gray-700">
              Tester: <span className="font-medium">{test.tester?.name}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
