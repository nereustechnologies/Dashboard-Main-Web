import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import SensorConnect from "@/components/sensor-connect"
import TestExercises from "@/components/test-exercises-refactored"
import TestRating from "@/components/test-rating"
import { ClipboardList, Bluetooth, Dumbbell, Star } from "lucide-react"
import { useTestStep } from "./test-step-context"
import { BluetoothProvider } from "@/hooks/use-bluetooth"

interface ContinueTestProps {
  testId: string
  customerId: string
  onClose?: (testId: string) => void
}

export default function ContinueTest({ testId, customerId, onClose }: ContinueTestProps) {
  const { step, setStep } = useTestStep()
  const [customerData, setCustomerData] = useState<any>(null)
  const [sensorConnected, setSensorConnected] = useState(false)
  const [testCompleted, setTestCompleted] = useState(false)
  const [testData, setTestData] = useState<any>({ exercises: [] })
  const [testExerciseData, setTestExerciseData] = useState<any>(null)

  useEffect(() => {
    const fetchTestData = async () => {
      const token = localStorage.getItem("token")
      if (!token) return
      try {
        const response = await fetch(`/api/tests/${testId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!response.ok) throw new Error("Failed to fetch test data")
        const data = await response.json()
        setCustomerData(data.test.customer)
        setTestExerciseData(data.test.exercises)
      } catch (e) {
        console.error(e)
      }
    }
    fetchTestData()
    setStep(2) // Start at sensor connect step
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testId])

  const handleSensorConnect = () => {
    setSensorConnected(true)
    setStep(3)
  }

  const handleTestComplete = (data: { exercises: any }) => {
    setTestData((prev: any) => ({ ...prev, exercises: data.exercises }))
    setTestCompleted(true)
    setStep(4)
  }

  const handleRatingSubmit = () => {
    if (onClose) onClose(testId); // Pass testId to onClose
    
    setTestData({ exercises: [] })
  }

  return (
 
      <Card className="border-primary/20 bg-card">
        <CardHeader>
          <CardTitle className="text-xl text-primary">Continue Fitness Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className={`flex-1 border-t-2 ${step >= 2 ? "border-primary" : "border-gray-700"}`}></div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? "bg-primary text-black" : "bg-gray-700"}`}>
                <Bluetooth size={18} />
              </div>
              <div className={`flex-1 border-t-2 ${step >= 3 ? "border-primary" : "border-gray-700"}`}></div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 3 ? "bg-primary text-black" : "bg-gray-700"}`}>
                <Dumbbell size={18} />
              </div>
              <div className={`flex-1 border-t-2 ${step >= 4 ? "border-primary" : "border-gray-700"}`}></div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 4 ? "bg-primary text-black" : "bg-gray-700"}`}>
                <Star size={18} />
              </div>
              <div className={`flex-1 border-t-2 ${step >= 4 ? "border-primary" : "border-gray-700"}`}></div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-400">
              <span>Connect Sensor</span>
              <span>Test Exercises</span>
              <span>Rating</span>
            </div>
          </div>

          {step === 2 && customerData && (
            <SensorConnect onConnect={handleSensorConnect} customerData={customerData} />
          )}

          {step === 3 && customerData && (
            <TestExercises
              onComplete={handleTestComplete}
              customerData={customerData}
              testId={testId}
              testExerciseData={testExerciseData}
            />
          )}

          {step === 4 && (
            <TestRating onSubmit={handleRatingSubmit} onBack={() => setStep(3)} customerData={customerData} testId={testId} />
          )}
        </CardContent>
      </Card>
   
  )
} 