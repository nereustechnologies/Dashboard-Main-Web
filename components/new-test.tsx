"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import CustomerForm from "@/components/customer-form"
import SensorConnect from "@/components/sensor-connect"
import TestExercises from "@/components/test-exercises-refactored"
import TestRating from "@/components/test-rating"
import { ClipboardList, Bluetooth, Dumbbell, Star } from "lucide-react"
import { useTestStep } from "./test-step-context"
import { BluetoothProvider } from "@/hooks/use-bluetooth"

export default function NewTest() {
  const {step, setStep} = useTestStep()
  const [customerData, setCustomerData] = useState<any>(null)
  const [sensorConnected, setSensorConnected] = useState(false)
  const [testCompleted, setTestCompleted] = useState(false)
  const [testData, setTestData] = useState<any>({
    exercises: [],
  })
  const [testId, setTestId] = useState<string>("")

  const handleCustomerSubmit = async (data: any) => {
    setCustomerData(data)
    const token = localStorage.getItem("token")
    if (!token) {
      alert("Authentication required. Please log in again.")
      return
    }

    try {
      const response = await fetch("/api/tests/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ customerId: data.id }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create a new test.")
      }

      const newTest = await response.json()
      setTestId(newTest.id)
      setStep(2)
    } catch (e) {
      const error = e instanceof Error ? e.message : "An unknown error occurred while creating the test."
      console.error("Failed to create test: ", error)
      alert(error)
    }
  }

  const handleSensorConnect = () => {
    setSensorConnected(true)
    setStep(3)
  }

  const handleTestComplete = (data: { exercises: any }) => {
    setTestData((prev: any) => ({
      ...prev,
      exercises: data.exercises,
    }))
    setTestCompleted(true)
    setStep(4)
  }

  const handleRatingSubmit = () => {
    // Reset the form
    setStep(1)
    setCustomerData(null)
    setSensorConnected(false)
    setTestCompleted(false)
    setTestData({
      exercises: [],
    })
  }

  return (

      <Card className="border-primary/20 bg-card">
        <CardHeader>
          <CardTitle className="text-xl text-primary">New Fitness Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className={`flex-1 border-t-2 ${step >= 1 ? "border-primary" : "border-gray-700"}`}></div>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? "bg-primary text-black" : "bg-gray-700"}`}
              >
                <ClipboardList size={18} />
              </div>
              <div className={`flex-1 border-t-2 ${step >= 2 ? "border-primary" : "border-gray-700"}`}></div>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? "bg-primary text-black" : "bg-gray-700"}`}
              >
                <Bluetooth size={18} />
              </div>
              <div className={`flex-1 border-t-2 ${step >= 3 ? "border-primary" : "border-gray-700"}`}></div>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 3 ? "bg-primary text-black" : "bg-gray-700"}`}
              >
                <Dumbbell size={18} />
              </div>
              <div className={`flex-1 border-t-2 ${step >= 4 ? "border-primary" : "border-gray-700"}`}></div>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 4 ? "bg-primary text-black" : "bg-gray-700"}`}
              >
                <Star size={18} />
              </div>
              <div className={`flex-1 border-t-2 ${step >= 4 ? "border-primary" : "border-gray-700"}`}></div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-400">
              <span>Customer Info</span>
              <span>Connect Sensor</span>
              <span>Test Exercises</span>
              <span>Rating</span>
            </div>
          </div>

          {step === 1 && <CustomerForm onSubmit={handleCustomerSubmit} />}

          {step === 2  && <SensorConnect onConnect={handleSensorConnect} customerData={customerData} />}

          {step === 3 && <TestExercises onComplete={handleTestComplete} customerData={customerData} testId={testId} />}

          {step === 4 && (
            <TestRating onSubmit={handleRatingSubmit} onBack={() => setStep(3)} customerData={customerData} testId={testId} />
          )}
        </CardContent>
      </Card>
 
  )
}
