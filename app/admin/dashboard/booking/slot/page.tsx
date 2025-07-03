'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRouter } from 'next/navigation'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { format } from 'date-fns'
import { Skeleton } from "@/components/ui/skeleton"

interface Location {
  id: string
  name: string
  address: string
}

interface TimeSlot {
  id: string
  startTime: string
  endTime: string
  count: number
  slotDate: {
    date: string
    location: {
      name: string
      address: string
    }
  }
}

// Cache for API responses
const cache = {
  locations: null as Location[] | null,
  timeSlots: null as TimeSlot[] | null,
  lastFetch: {
    locations: 0,
    timeSlots: 0
  }
}


// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000

export default function AddTimeSlot() {
    const [newLocation, setNewLocation] = useState({
  name: "",
  address: "",
  link: ""
})
  const router = useRouter()
  const [locations, setLocations] = useState<Location[]>([])
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [locationSuccess, setLocationSuccess] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

const [slotSuccess, setSlotSuccess] = useState(false)

  const [loading, setLoading] = useState(false)
  const [isLoadingLocations, setIsLoadingLocations] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    date: '',
    locationId: '',
    startTime: '',
    endTime: '',
    count: ''
  })
const handleDeleteSlot = async (slotId: string) => {
  const confirmed = confirm("Are you sure you want to delete this time slot?")
  if (!confirmed) return

  try {
    const token = localStorage.getItem("token")
    const response = await fetch(`/api/admin/timeslots/${slotId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const data = await response.json()

  if (!response.ok) {
  alert(data.error || "Failed to delete time slot")
  return
}

    // Remove from local state and cache
    const updatedTimeSlots = timeSlots.filter((slot) => slot.id !== slotId)
    cache.timeSlots = updatedTimeSlots
    cache.lastFetch.timeSlots = Date.now()
    setTimeSlots(updatedTimeSlots)
  } catch (error) {
    console.error("Delete failed:", error)
    setError(error instanceof Error ? error.message : "Failed to delete slot")
  }
}


  useEffect(() => {
      // Check if user is logged in
      const token = localStorage.getItem("token")
      const userData = localStorage.getItem("user")
  
      if (!token || !userData) {
        router.push("/login")
        return
      }
  
      const parsedUser = JSON.parse(userData)
      if (parsedUser.role !== "admin") {
        router.push("/login")
        return
      }
  
      setUser(parsedUser)
      setLoading(false)
    }, [router])
  
  // Fetch all data in parallel
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingLocations(true)
      setIsLoadingTimeSlots(true)
      setError(null)

      try {

        const token = localStorage.getItem("token")
        if (!token) {
          throw new Error("Authentication required")
        }
        // Check cache first
        const now = Date.now()
        const shouldFetchLocations = !cache.locations || (now - cache.lastFetch.locations) > CACHE_DURATION
        const shouldFetchTimeSlots = !cache.timeSlots || (now - cache.lastFetch.timeSlots) > CACHE_DURATION

        // Fetch data in parallel
        const [locationsResponse, timeSlotsResponse] = await Promise.all([
          shouldFetchLocations ? fetch('/api/admin/locations',{
              headers: {
            Authorization: `Bearer ${token}`,
          },
          }) : Promise.resolve(null),
          shouldFetchTimeSlots ? fetch('/api/admin/timeslots',{
              headers: {
            Authorization: `Bearer ${token}`,
          },
          }) : Promise.resolve(null)
        ])

        // Handle locations
        if (shouldFetchLocations && locationsResponse) {
          if (!locationsResponse.ok) throw new Error('Failed to fetch locations')
          const data = await locationsResponse.json()
          cache.locations = data
          cache.lastFetch.locations = now
          setLocations(data)
          
          // Auto-select if only one location
          if (data.length === 1) {
            setFormData(prev => ({ ...prev, locationId: data[0].id }))
          }
        } else if (cache.locations) {
          setLocations(cache.locations)
        }

        // Handle time slots
        if (shouldFetchTimeSlots && timeSlotsResponse) {
          if (!timeSlotsResponse.ok) throw new Error('Failed to fetch time slots')
          const data = await timeSlotsResponse.json()
          cache.timeSlots = data
          cache.lastFetch.timeSlots = now
          setTimeSlots(data)
        } else if (cache.timeSlots) {
          setTimeSlots(cache.timeSlots)
        }

      } catch (error) {
        console.error('Error fetching data:', error)
        setError('Failed to load data. Please try again.')
      } finally {
        setIsLoadingLocations(false)
        setIsLoadingTimeSlots(false)
      }
    }

    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
          const token = localStorage.getItem("token")
        if (!token) {
          throw new Error("Authentication required")
        }
      const response = await fetch('/api/admin/timeslots', {
        method: 'POST',
        headers: {

            Authorization: `Bearer ${token}`,
      
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          count: parseInt(formData.count)
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSlotSuccess(true)
setTimeout(() => setSlotSuccess(false), 3000)

        // Update cache with new time slot
        const slotsResponse = await fetch('/api/admin/timeslots',{
              headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (slotsResponse.ok) {
            
          const slotsData = await slotsResponse.json()
          cache.timeSlots = slotsData
          cache.lastFetch.timeSlots = Date.now()
          setTimeSlots(slotsData)
        }
        // Reset form
        setFormData({
          date: '',
          locationId: '',
          startTime: '',
          endTime: '',
          count: ''
        })
      } else {
        throw new Error(data.error || 'Failed to create time slot')
      }
    } catch (error) {
      console.error('Error creating time slot:', error)
      setError(error instanceof Error ? error.message : 'Failed to create time slot')
    } finally {
      setLoading(false)
    }
  }

  // Group time slots by date
  const groupedTimeSlots = timeSlots.reduce((acc, slot) => {
    const date = new Date(slot.slotDate.date).toISOString().split('T')[0]
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(slot)
    return acc
  }, {} as Record<string, TimeSlot[]>)

  // Sort dates
  const sortedDates = Object.keys(groupedTimeSlots).sort()

  // Loading skeleton for the location select
  const LocationSkeleton = () => (
    <div className="space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-10 w-full" />
    </div>
  )

  // Loading skeleton for the time slots table
  const TableSkeleton = () => (
    <div className="space-y-6">
      {[1, 2].map((date) => (
        <div key={date} className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      ))}
    </div>
  )

  return (
    
    <div className="max-w-6xl mx-auto space-y-8">
        <Card className="p-6">
  <h2 className="text-xl font-semibold mb-4">Add New Location</h2>
  <form
    onSubmit={async (e) => {
      e.preventDefault()
      setError(null)
      setLoading(true)

      try {
        const token = localStorage.getItem("token")
        const res = await fetch("/api/admin/locations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: newLocation.name,
            address: newLocation.address,
            link: newLocation.link,
          }),
        })
     
        if (!res.ok) {
          const errorData = await res.json()
          throw new Error(errorData.error || "Failed to create location")
        }
        setLocationSuccess(true)
setTimeout(() => setLocationSuccess(false), 3000)


        const added = await res.json()
        setLocations((prev) => [...prev, added])
        setFormData((prev) => ({ ...prev, locationId: added.id }))
        setNewLocation({ name: "", address: "", link: "" })
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }}
    className="space-y-4"
  >
    <Input
      placeholder="Location Name"
      value={newLocation.name}
      onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
      required
    />
    <Input
      placeholder="Address"
      value={newLocation.address}
      onChange={(e) => setNewLocation({ ...newLocation, address: e.target.value })}
      required
    />
    <Input
      placeholder="Google Maps Link (optional)"
      value={newLocation.link}
      onChange={(e) => setNewLocation({ ...newLocation, link: e.target.value })}
    />
    <Button type="submit" className="w-full" disabled={loading}>
      {loading ? "Creating..." : "Add Location"}
    </Button>
  </form>
</Card>
{locationSuccess && (
  <Alert variant="default" className="mb-4 border-green-600 text-green-800">
    <AlertDescription>Location added successfully!</AlertDescription>
  </Alert>
)}

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Add Time Slot</h1>
       
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {slotSuccess && (
  <Alert variant="default" className="mb-4 border-green-600 text-green-800">
    <AlertDescription>Time slot created successfully!</AlertDescription>
  </Alert>
)}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              {isLoadingLocations ? (
                <LocationSkeleton />
              ) : locations.length > 0 ? (
                <Select
                  value={formData.locationId}
                  onValueChange={(value) => setFormData({ ...formData, locationId: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem 
                        key={location.id} 
                        value={location.id}
                      >
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-gray-500">No locations available</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Start Time</label>
              <Input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">End Time</label>
              <Input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Count</label>
              <Input
                type="number"
                min="1"
                value={formData.count}
                onChange={(e) => setFormData({ ...formData, count: e.target.value })}
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || locations.length === 0 || !formData.locationId}
            >
              {loading ? 'Creating...' : 'Create Time Slot'}
            </Button>
          </form>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Existing Time Slots</h2>
          {isLoadingTimeSlots ? (
            <TableSkeleton />
          ) : (
            <div className="space-y-6">
              {sortedDates.map((date) => (
                <div key={date} className="space-y-2">
                  <h3 className="font-medium text-lg">
                    {format(new Date(date), 'MMMM d, yyyy')}
                  </h3>
                  <Table>
                   <TableHeader>
  <TableRow>
    <TableHead>Location</TableHead>
    <TableHead>Time</TableHead>
    <TableHead>Slots Left</TableHead>
    <TableHead>Actions</TableHead> {/* 👈 new */}
  </TableRow>
</TableHeader>
<TableBody>
  {groupedTimeSlots[date].map((slot) => (
    <TableRow key={slot.id}>
      <TableCell>{slot.slotDate.location.name}</TableCell>
      <TableCell>
        {format(new Date(slot.startTime), 'h:mm a')} - {format(new Date(slot.endTime), 'h:mm a')}
      </TableCell>
      <TableCell>{slot.count}</TableCell>
      <TableCell>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => handleDeleteSlot(slot.id)}
        >
          Delete
        </Button>
      </TableCell>
    </TableRow>
  ))}
</TableBody>

                  </Table>
                </div>
              ))}
              {sortedDates.length === 0 && (
                <p className="text-sm text-gray-500">No time slots created yet</p>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
} 