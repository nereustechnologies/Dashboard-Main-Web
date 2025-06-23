'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { useRouter } from "next/navigation"
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format } from 'date-fns'
import { CalendarIcon, X, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

interface Booking {
  id: string
  name: string
  email: string
  age: number
  gender: string
  whatsapp: string
  fitnessGoal: string
  whyMove: string
  uniqueId: string
  clientSessionNo: number
  consent: boolean
  paymentStatus: 'pending' | 'paid' | 'failed'
  slotDate: {
    date: string
    location: {
      name: string
    }
    timeSlot: {
      startTime: string
      endTime: string
    }
  }
}

interface Location {
  id: string
  name: string
}

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedLocation, setSelectedLocation] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
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
    setIsLoading(false)
  }, [router])

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const token = localStorage.getItem("token")
        const response = await fetch('/api/admin/bookings', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!response.ok) throw new Error('Failed to fetch data')
        const data = await response.json()
        setBookings(data.bookings)
        setLocations(data.locations)
      } catch (error) {
        console.error('Error fetching data:', error)
        setError('Failed to load data. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const clearFilters = () => {
    setSelectedDate(undefined)
    setSelectedLocation('all')
  }

  const filteredBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.slotDate.date)
    const matchesDate = !selectedDate || (
      bookingDate.getFullYear() === selectedDate.getFullYear() &&
      bookingDate.getMonth() === selectedDate.getMonth() &&
      bookingDate.getDate() === selectedDate.getDate()
    )
    const matchesLocation = selectedLocation === 'all' || booking.slotDate.location.name === selectedLocation
    return matchesDate && matchesLocation
  })

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Bookings</h1>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("w-[200px] justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : "All Dates"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus />
            </PopoverContent>
          </Popover>

          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map((location) => (
                <SelectItem key={location.id} value={location.name}>{location.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(selectedDate || selectedLocation) && (
            <Button variant="ghost" size="icon" onClick={clearFilters} className="h-10 w-10">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>UserId</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Session No</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                  No bookings found
                </TableCell>
              </TableRow>
            ) : (
              filteredBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>{booking.uniqueId}</TableCell>
                  <TableCell>{new Date(booking.slotDate.date).toLocaleDateString()}</TableCell>
                  <TableCell>{formatTime(booking.slotDate.timeSlot.startTime)} - {formatTime(booking.slotDate.timeSlot.endTime)}</TableCell>
                  <TableCell>{booking.slotDate.location.name}</TableCell>
                  <TableCell>{booking.name}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div>{booking.email}</div>
                      <div className="text-sm text-muted-foreground">{booking.whatsapp}</div>
                    </div>
                  </TableCell>
                  <TableCell>{booking.age}</TableCell>
                  <TableCell>{booking.gender}</TableCell>
                  <TableCell>
                    <Badge variant={
                      booking.paymentStatus === 'paid' ? 'default' :
                      booking.paymentStatus === 'failed' ? 'destructive' :
                      'secondary'}>
                      {booking.paymentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>{booking.clientSessionNo}</TableCell>
                  <TableCell>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-red-500 hover:text-red-700"
                      onClick={async () => {
                        const confirmDelete = confirm("Are you sure you want to delete this booking?")
                        if (!confirmDelete) return
                        try {
                          const token = localStorage.getItem("token")
                          const res = await fetch(`/api/admin/bookings/${booking.id}`, {
                            method: 'DELETE',
                            headers: { Authorization: `Bearer ${token}` },
                          })
                          if (!res.ok) throw new Error("Failed to delete booking")
                          setBookings(prev => prev.filter(b => b.id !== booking.id))
                        } catch (err) {
                          console.error("Delete failed:", err)
                          alert("Failed to delete booking.")
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}