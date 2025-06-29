"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Calendar, 
  User, 
  Activity, 
  Heart, 
  Moon, 
  Utensils, 
  Smile, 
  Target, 
  TrendingUp, 
  FileText, 
  Star,
  Award,
  Zap,
  BookOpen,
  Phone,
  Mail,
  MapPin,
  Clock,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Loader2,
  Download,
  FileDown
} from "lucide-react"
import { convertCustomerDataToReportData, downloadAsJSON, downloadAsText, generateFilename } from "@/lib/report-converter"

interface CustomerInfoModalProps {
  test: any
  trigger?: React.ReactNode
}

export function CustomerInfoModal({ test, trigger }: CustomerInfoModalProps) {
  const [open, setOpen] = useState(false)
  const [customerData, setCustomerData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open && test?.customer?.id) {
      fetchCustomerData()
    }
  }, [open, test?.customer?.id])

  const fetchCustomerData = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("No authentication token found")
        return
      }

      const response = await fetch(`/api/customers/${test.customer.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch customer data")
      }

      const data = await response.json()
      setCustomerData(data.customer)
    } catch (err) {
      console.error("Error fetching customer data:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  if (!test || !test.customer) {
    return null
  }

  const { customer } = test

  const activityLevelColors = {
    active: "bg-green-500",
    moderately_active: "bg-yellow-500",
    not_active: "bg-red-500"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const renderBasicInfo = () => (
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-[#00D4EF] flex items-center gap-2">
                <User className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-gray-400">Name</label>
                  <p className="text-white font-medium">{customer.name}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Age</label>
                  <p className="text-white font-medium">{customer.age} years</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Gender</label>
                  <p className="text-white font-medium capitalize">{customer.gender}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Height</label>
                  <p className="text-white font-medium">{customer.height} cm</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Weight</label>
                  <p className="text-white font-medium">{customer.weight} kg</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">BMI</label>
                  <p className="text-white font-medium">
                    {((customer.weight / Math.pow(customer.height / 100, 2))).toFixed(1)}
                  </p>
                </div>
                <div>
            <label className="text-sm text-gray-400">Unique ID</label>
            <p className="text-white font-medium">{customer.uniqueId || 'N/A'}</p>
                </div>
                <div>
            <label className="text-sm text-gray-400">Created</label>
            <p className="text-white font-medium">{formatDate(customer.createdAt)}</p>
                </div>
                <div>
            <label className="text-sm text-gray-400">Last Updated</label>
            <p className="text-white font-medium">{formatDate(customer.updatedAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
  )

  const renderLifestyleInfo = () => (
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-[#00D4EF] flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Lifestyle Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-gray-400" />
                  <div>
                    <label className="text-sm text-gray-400">Activity Level</label>
                    <Badge 
                      className={`${activityLevelColors[customer.activityLevel as keyof typeof activityLevelColors] || 'bg-gray-600'}`}
                    >
                      {customer.activityLevel.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Moon className="h-4 w-4 text-gray-400" />
                  <div>
                    <label className="text-sm text-gray-400">Sleep Level</label>
                    <p className="text-white font-medium">{customer.sleepLevels}/10</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Utensils className="h-4 w-4 text-gray-400" />
                  <div>
                    <label className="text-sm text-gray-400">Calorie Intake</label>
                    <p className="text-white font-medium">{customer.calorieIntake} kcal/day</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Smile className="h-4 w-4 text-gray-400" />
                  <div>
                    <label className="text-sm text-gray-400">Mood</label>
                    <p className="text-white font-medium capitalize">{customer.mood}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
  )

  const renderTests = () => (
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
        <CardTitle className="text-[#00D4EF] flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          All Tests ({customerData?.tests?.length || 0})
        </CardTitle>
              </CardHeader>
              <CardContent>
        <div className="space-y-4">
          {customerData?.tests?.map((test: any) => (
            <div key={test.id} className="border border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-white font-medium">Test #{test.id.slice(-8)}</h4>
                  <p className="text-sm text-gray-400">{formatDate(test.date)}</p>
                </div>
                <Badge 
                  variant={test.status === 'completed' ? 'default' : 'secondary'}
                  className={test.status === 'completed' ? 'bg-green-600' : 'bg-yellow-600'}
                >
                  {test.status}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="text-sm text-gray-400">Tester</label>
                  <p className="text-white font-medium">{test.tester?.name || 'Unknown'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Exercises</label>
                  <p className="text-white font-medium">
                    {test.exercises?.filter((ex: any) => ex.completed).length || 0} / {test.exercises?.length || 0} completed
                  </p>
                </div>
              </div>

              {/* Test Rating */}
              {test.ratings && (
                <div className="mb-3 p-3 bg-gray-800 rounded-lg">
                  <h5 className="text-[#00D4EF] font-medium mb-2">Test Rating</h5>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <label className="text-gray-400">Overall</label>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-white">{test.ratings.overall}/10</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-gray-400">Mobility</label>
                      <span className="text-white">{test.ratings.mobility}/10</span>
                    </div>
                    <div>
                      <label className="text-gray-400">Strength</label>
                      <span className="text-white">{test.ratings.strength}/10</span>
                    </div>
                    <div>
                      <label className="text-gray-400">Endurance</label>
                      <span className="text-white">{test.ratings.endurance}/10</span>
                    </div>
                    <div>
                      <label className="text-gray-400">RPE</label>
                      <span className="text-white">{test.ratings.RPE}/10</span>
                    </div>
                    <div>
                      <label className="text-gray-400">Felt After</label>
                      <span className="text-white capitalize">{test.ratings.FeltAfterWorkOut}</span>
                    </div>
                  </div>
                  {test.ratings.observation && (
                    <div className="mt-2">
                      <label className="text-sm text-gray-400">Observation</label>
                      <p className="text-white text-sm">{test.ratings.observation}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Exercises */}
              {test.exercises && test.exercises.length > 0 && (
                <div>
                  <h5 className="text-[#00D4EF] font-medium mb-2">Exercises</h5>
                <div className="space-y-2">
                    {test.exercises.map((exercise: any) => (
                      <div key={exercise.id} className="p-3 bg-gray-800 rounded">
                        <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-white font-medium capitalize">
                          {exercise.name.replace('_', ' ')}
                        </p>
                        <p className="text-sm text-gray-400 capitalize">{exercise.category}</p>
                      </div>
                          <div className="flex items-center gap-2">
                      <Badge 
                        variant={exercise.completed ? 'default' : 'secondary'}
                        className={exercise.completed ? 'bg-green-600' : 'bg-gray-600'}
                      >
                        {exercise.completed ? 'Completed' : 'Pending'}
                      </Badge>
                            {exercise.assetFiles && exercise.assetFiles.length > 0 && (
                              <Badge variant="outline" className="text-[#00D4EF] border-[#00D4EF]">
                                {exercise.assetFiles.length} files
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {/* Analysis Results */}
                        {exercise.assetFiles && exercise.assetFiles.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {exercise.assetFiles.map((file: any) => (
                              file.analysisResults && (
                                <div key={file.id} className="p-2 bg-gray-700 rounded text-xs">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-[#00D4EF] font-medium">Analysis Results</span>
                                    <span className="text-gray-400">{file.fileName}</span>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    {(() => {
                                      try {
                                        // Handle different analysis result formats
                                        let analysisData = file.analysisResults;
                                        
                                        // If it has a body field with JSON string, parse it
                                        if (analysisData.body && typeof analysisData.body === 'string') {
                                          try {
                                            analysisData = JSON.parse(analysisData.body);
                                          } catch (e) {
                                            // If parsing fails, use the original structure
                                          }
                                        }
                                        
                                        // Filter out unwanted keys and display the metrics
                                        const skipKeys = ['output_key', 'status', 'body'];
                                        return Object.entries(analysisData)
                                          .filter(([key]) => !skipKeys.includes(key.toLowerCase()))
                                          .map(([key, value]) => (
                                            <div key={key} className="flex justify-between">
                                              <span className="text-gray-300 capitalize">
                                                {key.replace(/_/g, ' ')}:
                                              </span>
                                              <span className="text-white font-mono">
                                                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                              </span>
                                            </div>
                                          ));
                                      } catch (error) {
                                        return (
                                          <div className="text-red-400 text-xs">
                                            Error parsing analysis results
                                          </div>
                                        );
                                      }
                                    })()}
                                  </div>
                                </div>
                              )
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  const renderSectionEvaluations = () => (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="text-[#00D4EF] flex items-center gap-2">
          <Target className="h-5 w-5" />
          Section Evaluations ({customerData?.sectionEvaluations?.length || 0})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {customerData?.sectionEvaluations?.map((evaluation: any) => (
            <div key={evaluation.id} className="border border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-medium capitalize">{evaluation.section} Evaluation</h4>
                <span className="text-sm text-gray-400">{formatDate(evaluation.createdAt)}</span>
              </div>
              
              {evaluation.dropdowns && Object.keys(evaluation.dropdowns).length > 0 && (
                <div className="mb-3">
                  <h5 className="text-[#00D4EF] font-medium mb-2">Dropdowns</h5>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(evaluation.dropdowns).map(([key, value]) => (
                      <div key={key}>
                        <label className="text-sm text-gray-400 capitalize">{key.replace('_', ' ')}</label>
                        <p className="text-white font-medium">{value as string}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {evaluation.comments && Object.keys(evaluation.comments).length > 0 && (
                <div className="mb-3">
                  <h5 className="text-[#00D4EF] font-medium mb-2">Comments</h5>
                  <div className="space-y-2">
                    {Object.entries(evaluation.comments).map(([key, value]) => (
                      <div key={key}>
                        <label className="text-sm text-gray-400 capitalize">{key.replace('_', ' ')}</label>
                        <p className="text-white text-sm">{value as string}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {evaluation.textLabels && Object.keys(evaluation.textLabels).length > 0 && (
                <div>
                  <h5 className="text-[#00D4EF] font-medium mb-2">Text Labels</h5>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(evaluation.textLabels).map(([key, value]) => (
                      <div key={key}>
                        <label className="text-sm text-gray-400 capitalize">{key.replace('_', ' ')}</label>
                        <p className="text-white font-medium">{value as string}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  const renderTrainingPurposes = () => (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="text-[#00D4EF] flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Training Purposes ({customerData?.trainingPurposes?.length || 0})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {customerData?.trainingPurposes?.map((purpose: any) => (
            <div key={purpose.id} className="border border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-white font-medium capitalize">{purpose.category}</h4>
                  <p className="text-sm text-gray-400">Slot {purpose.slot}</p>
                </div>
                <span className="text-sm text-gray-400">{formatDate(purpose.createdAt)}</span>
              </div>
              
              <div>
                <h5 className="text-[#00D4EF] font-medium mb-2">{purpose.title}</h5>
                <p className="text-white text-sm">{purpose.paragraph}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  const renderScoresToBeat = () => (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="text-[#00D4EF] flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Scores to Beat ({customerData?.scoresToBeat?.length || 0})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {customerData?.scoresToBeat?.map((score: any) => (
            <div key={score.id} className="border border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-medium">{score.title}</h4>
                <span className="text-sm text-gray-400">{formatDate(score.createdAt)}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400">Current Score</label>
                  <p className="text-white font-medium text-lg">{score.current}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Best Score</label>
                  <p className="text-white font-medium text-lg text-[#00D4EF]">{score.best}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  const renderMovementSignature = () => (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="text-[#00D4EF] flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Movement Signature
        </CardTitle>
      </CardHeader>
      <CardContent>
        {customerData?.movementSignature ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400">Identity</label>
              <p className="text-white font-medium capitalize">{customerData.movementSignature.identity}</p>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-gray-400">Mobility Rating</label>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="text-white font-medium">{customerData.movementSignature.mobilityRating}/10</span>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-400">Strength Rating</label>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="text-white font-medium">{customerData.movementSignature.strengthRating}/10</span>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-400">Endurance Rating</label>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="text-white font-medium">{customerData.movementSignature.enduranceRating}/10</span>
                </div>
              </div>
            </div>
            
            <div className="text-sm text-gray-400">
              Last updated: {formatDate(customerData.movementSignature.updatedAt)}
            </div>
          </div>
        ) : (
          <p className="text-gray-400">No movement signature data available</p>
        )}
      </CardContent>
    </Card>
  )

  const handleDownloadJSON = () => {
    if (!customerData) return
    
    try {
      const reportData = convertCustomerDataToReportData(customerData)
      const filename = generateFilename(customerData.name, 'json')
      downloadAsJSON(reportData, filename)
    } catch (error) {
      console.error('Error downloading JSON:', error)
      alert('Failed to download JSON file')
    }
  }

  const handleDownloadText = () => {
    if (!customerData) return
    
    try {
      const reportData = convertCustomerDataToReportData(customerData)
      const filename = generateFilename(customerData.name, 'txt')
      downloadAsText(reportData, filename)
    } catch (error) {
      console.error('Error downloading text file:', error)
      alert('Failed to download text file')
    }
  }

  const handleDownloadPDF = async () => {
    if (!customerData) return
    
    try {
      const reportData = convertCustomerDataToReportData(customerData)
      
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: reportData }),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.success && result.previewUrl) {
        // Open the preview page in a new tab
        window.open(result.previewUrl, '_blank')
      } else {
        throw new Error('Failed to generate preview URL')
      }
    } catch (error) {
      console.error('Error opening PDF preview:', error)
      alert('Failed to open PDF preview')
    }
  }

  const renderClientInfo = () => (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="text-[#00D4EF] flex items-center gap-2">
          <User className="h-5 w-5" />
          Client Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        {customerData?.client ? (
          <div className="space-y-6">
            {/* Basic Client Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400">Full Name</label>
                <p className="text-white font-medium">{customerData.client.fullName}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Age</label>
                <p className="text-white font-medium">{customerData.client.age} years</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Gender</label>
                <p className="text-white font-medium capitalize">{customerData.client.gender}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Unique ID</label>
                <p className="text-white font-medium">{customerData.client.uniqueId}</p>
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <div>
                  <label className="text-sm text-gray-400">Email</label>
                  <p className="text-white font-medium">{customerData.client.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <div>
                  <label className="text-sm text-gray-400">WhatsApp</label>
                  <p className="text-white font-medium">{customerData.client.whatsapp}</p>
                </div>
              </div>
            </div>

            {/* Goals and History */}
            <div>
              <label className="text-sm text-gray-400">Why Move</label>
              <p className="text-white font-medium">{customerData.client.whyMove}</p>
            </div>
            <div>
              <label className="text-sm text-gray-400">Fitness Goal</label>
              <p className="text-white font-medium">{customerData.client.fitnessGoal}</p>
            </div>
            {customerData.client.medicalHistory && (
              <div>
                <label className="text-sm text-gray-400">Medical History</label>
                <p className="text-white font-medium">{customerData.client.medicalHistory}</p>
              </div>
            )}

            {/* Bookings */}
            {customerData.client.Booking && customerData.client.Booking.length > 0 && (
              <div>
                <h5 className="text-[#00D4EF] font-medium mb-3">Bookings ({customerData.client.Booking.length})</h5>
                <div className="space-y-3">
                  {customerData.client.Booking.map((booking: any) => (
                    <div key={booking.id} className="border border-gray-700 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-white font-medium">Order #{booking.orderId}</p>
                          <p className="text-sm text-gray-400">Session #{booking.clientSessionNo}</p>
                        </div>
                        <Badge 
                          variant={booking.paymentStatus === 'PAID' ? 'default' : 'secondary'}
                          className={booking.paymentStatus === 'PAID' ? 'bg-green-600' : 'bg-yellow-600'}
                        >
                          {booking.paymentStatus}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <label className="text-gray-400">Invoice</label>
                          <p className="text-white">#{booking.invoiceNumber}</p>
                        </div>
                        <div>
                          <label className="text-gray-400">Payment ID</label>
                          <p className="text-white">{booking.paymentId}</p>
                        </div>
                        <div>
                          <label className="text-gray-400">Location</label>
                          <p className="text-white">{booking.timeSlot.slotDate.location.name}</p>
                        </div>
                        <div>
                          <label className="text-gray-400">Date & Time</label>
                          <p className="text-white">{formatDate(booking.timeSlot.startTime)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Email Logs */}
            {customerData.client.EmailLog && customerData.client.EmailLog.length > 0 && (
              <div>
                <h5 className="text-[#00D4EF] font-medium mb-3">Email History ({customerData.client.EmailLog.length})</h5>
                <div className="space-y-2">
                  {customerData.client.EmailLog.map((email: any) => (
                    <div key={email.id} className="flex items-center justify-between p-2 bg-gray-800 rounded">
                      <div>
                        <p className="text-white font-medium">{email.subject}</p>
                        <p className="text-sm text-gray-400">{email.emailType} - {email.sentVia}</p>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant={email.status === 'SENT' ? 'default' : 'secondary'}
                          className={email.status === 'SENT' ? 'bg-green-600' : 'bg-yellow-600'}
                        >
                          {email.status}
                        </Badge>
                        <p className="text-xs text-gray-400 mt-1">{formatDate(email.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-400">No client information available</p>
        )}
              </CardContent>
            </Card>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="border-[#00D4EF] text-[#00D4EF] hover:bg-[#00D4EF]/10">
            <User className="h-4 w-4 mr-2" />
            View Customer Info
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] bg-black border-gray-700 text-white overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-[#00D4EF] text-xl font-bold">
              Comprehensive Customer Information
            </DialogTitle>
            
            {customerData && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadJSON}
                  className="border-[#00D4EF] text-[#00D4EF] hover:bg-[#00D4EF]/10"
                >
                  <Download className="h-4 w-4 mr-2" />
                  JSON
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadText}
                  className="border-[#00D4EF] text-[#00D4EF] hover:bg-[#00D4EF]/10"
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  TXT
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadPDF}
                  className="border-green-500 text-green-500 hover:bg-green-500/10"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Preview PDF
                </Button>
              </div>
          )}
        </div>
        </DialogHeader>
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-[#00D4EF]" />
            <span className="ml-2 text-white">Loading customer data...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <span className="ml-2 text-red-500">{error}</span>
          </div>
        ) : (
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-7 bg-gray-900">
              <TabsTrigger value="basic" className="text-xs">Basic</TabsTrigger>
              <TabsTrigger value="tests" className="text-xs">Tests</TabsTrigger>
              <TabsTrigger value="evaluations" className="text-xs">Evaluations</TabsTrigger>
              <TabsTrigger value="training" className="text-xs">Training</TabsTrigger>
              <TabsTrigger value="scores" className="text-xs">Scores</TabsTrigger>
              <TabsTrigger value="signature" className="text-xs">Signature</TabsTrigger>
              <TabsTrigger value="client" className="text-xs">Client</TabsTrigger>
            </TabsList>
            
            <div className="mt-4 overflow-y-auto max-h-[calc(90vh-180px)] pr-2">
              <TabsContent value="basic" className="space-y-6">
                {renderBasicInfo()}
                {renderLifestyleInfo()}
              </TabsContent>
              
              <TabsContent value="tests" className="space-y-6">
                {renderTests()}
              </TabsContent>
              
              <TabsContent value="evaluations" className="space-y-6">
                {renderSectionEvaluations()}
              </TabsContent>
              
              <TabsContent value="training" className="space-y-6">
                {renderTrainingPurposes()}
              </TabsContent>
              
              <TabsContent value="scores" className="space-y-6">
                {renderScoresToBeat()}
              </TabsContent>
              
              <TabsContent value="signature" className="space-y-6">
                {renderMovementSignature()}
              </TabsContent>
              
              <TabsContent value="client" className="space-y-6">
                {renderClientInfo()}
              </TabsContent>
            </div>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  )
} 