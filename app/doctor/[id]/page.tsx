"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { ExerciseSidebar } from "@/components/exercise-sidebar"
import { ExerciseContent } from "@/components/exercise-content"
import { SectionEvaluation } from "@/components/section-evaluation"
import { exerciseData } from "@/lib/data" // Mock data for exercises
import { TrainingPurposeForm } from "@/components/training-purpose-form"
import { MovementSignatureForm } from "@/components/movement-signature-form"
import { ScoresToBeat } from "@/components/scoresToBeat-form" 
import { CustomerInfoModal } from "@/components/customer-info-modal"

function PatientDashboard() {
  const router = useRouter()
  const params = useParams()
  const testId = params.id as string

  // Keep track of selected exercise by name
  const [selectedExercise, setSelectedExercise] = useState<string>("knee_flexion")
  const [sidebarOpen, setSidebarOpen] = useState(true) // From new structure
  const [test, setTest] = useState<any>(null) // Existing state
  const [loading, setLoading] = useState(true) // Existing state
  const [error, setError] = useState("") // Existing state

  useEffect(() => {
    if (!testId) return

    const fetchTestDetails = async () => {
      setLoading(true)
      setError("")
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          router.push("/login") // Or doctor's login
          return
        }

        const response = await fetch(`/api/tests/${testId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to fetch test details")
        }

        const data = await response.json()
        setTest(data.test)
        console.log(data)
        // Set initial selected exercise to the first exercise returned from backend if not already selected.
        if (data.test.exercises && data.test.exercises.length > 0) {
          setSelectedExercise(data.test.exercises[0].name)
        }
      } catch (err) {
        console.error("Error fetching test details:", err)
        setError(err instanceof Error ? err.message : "An unknown error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchTestDetails()
  }, [testId, router])

  const handleExerciseSelect = (exercise: string) => {
    setSelectedExercise(exercise)
  }

  const toggleSidebar = () => { // From new structure
    setSidebarOpen(!sidebarOpen)
  }
  const handleLogout = () => {
    localStorage.removeItem("token"); // Example logout action
    router.push("/login"); // Redirect to login page
  };

  // Determine current section based on selected exercise
  const categoryMap: Record<string, "mobility" | "strength" | "endurance"> = {
    knee_flexion: "mobility",
    lunge_stretch: "mobility",
    knee_to_wall: "mobility",
    squats: "strength",
    lunges: "strength",
    plank_hold: "endurance",
    stepUp: "endurance",
   
  }

  const currentSection = categoryMap[selectedExercise] || "mobility"

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-black text-white">Loading test details...</div>
  if (error) return <div className="flex min-h-screen items-center justify-center bg-black text-red-500">Error: {error}</div>
  if (!test) return <div className="flex min-h-screen items-center justify-center bg-black text-white">Test not found.</div>

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* New Header */}
      <header className="sticky top-0 z-40 border-b border-gray-700 bg-black">
        <div className="container mx-auto flex h-16 items-center justify-between py-4 px-4">
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleSidebar} 
              className="md:hidden p-2 text-[#00D4EF] hover:bg-[#00D4EF]/10 rounded-md"
              aria-label="Toggle sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="h-8 w-8 rounded-md bg-[#00D4EF]"></div> {/* Placeholder logo */}
            <h1 className="text-xl md:text-2xl font-bold text-[#00D4EF]">Doctor Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            {test && (
              <CustomerInfoModal 
                test={test}
                trigger={
                  <Button 
                    variant="outline" 
                    className="border-[#00D4EF] text-[#00D4EF] hover:bg-[#00D4EF]/10"
                  >
                    {test.customer?.name || 'Customer Info'}
                  </Button>
                }
              />
            )}
            <span className="hidden sm:inline text-gray-400">Welcome, Dr. Smith</span> {/* Placeholder name */}
            <Button 
              variant="outline" 
              onClick={handleLogout} 
              className="border-[#00D4EF] text-[#00D4EF] hover:bg-[#00D4EF]/10 hover:text-[#00D4EF]"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>
      

      <div className="flex flex-1 overflow-hidden">
        <ExerciseSidebar
          exercises={test.exercises.map((ex: any) => ex.name)}
          selectedExercise={selectedExercise}
          onSelectExercise={handleExerciseSelect}
          isOpen={sidebarOpen}
          onToggle={toggleSidebar}
        />
        <main className="flex-1 space-y-8">
          {selectedExercise === "training_purpose" ? (
            <div className="px-4 md:px-6">
              <TrainingPurposeForm customerId={test.customerId} />
            </div>
          ) : selectedExercise === "movement_signature" ? (
            <div className="px-4 md:px-6">
              <MovementSignatureForm customerId={test.customerId} />
            </div>
          ) : selectedExercise === "scoresToBeat" ?(

            <ScoresToBeat customerId={test.customerId} />
          ):(
            <div className="w-full grid lg:grid-cols-2 items-start">
              {/* Left column: Exercise content */}
              <div className="lg:col-span-1">
                {/* ExerciseContent using mock data */}
                <section aria-labelledby="exercise-guide-heading">
                  <div className="rounded-lg border border-gray-700 p-4">
                 {(() => {
  const exerciseObj = test.exercises.find((ex: any) => ex.name === selectedExercise)

  // Fallback: Prevent crash if invalid key
  const exerciseDataForCurrent = exerciseData[selectedExercise as keyof typeof exerciseData]

 return exerciseObj && exerciseDataForCurrent ? (
  <ExerciseContent
    exerciseData={exerciseDataForCurrent}
    exerciseName={selectedExercise}
    exerciseId={exerciseObj.id}
  />
) : (
  <div className="text-red-500 p-4">
    Exercise data not found for: <strong>{selectedExercise}</strong>
  </div>
)
})()}

                  </div>
                </section>
              </div>

              {/* Right column: Section evaluation form */}
              <div className="sticky">
                <SectionEvaluation section={currentSection} customerId={test.customerId} />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default PatientDashboard