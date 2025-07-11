'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { format } from 'date-fns'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { DatePicker } from '@/components/ui/date-picker'
import {
  Table, TableHead, TableHeader, TableRow, TableCell, TableBody,
} from '@/components/ui/table'

interface TimeSlot {
  id: string
  startTime: string
  endTime: string
  count: number
  price?: number
  slotDate: {
    location: {
      id: string
      name: string
    }
    date: string
  }
}

interface Location {
  id: string
  name: string
}

export default function TimeSlotPriceConfig() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null)
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [priceMap, setPriceMap] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (!token || !userData) return router.push('/login')

    const parsedUser = JSON.parse(userData)
    if (parsedUser.role !== 'admin') return router.push('/login')
  }, [router])

useEffect(() => {
  const fetchFilteredLocations = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/admin/timeslots', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const allSlots: TimeSlot[] = await res.json()

      if (!selectedDate) return

      const selectedDay = format(selectedDate, 'yyyy-MM-dd')

      // Filter slots for selected date
      const slotsForDate = allSlots.filter(
        (slot) => format(new Date(slot.slotDate.date), 'yyyy-MM-dd') === selectedDay
      )

      // Extract unique locations
      const uniqueMap: Record<string, Location> = {}
      slotsForDate.forEach((slot) => {
        const loc = slot.slotDate.location
        uniqueMap[loc.id] = loc
      })

      const filteredLocations = Object.values(uniqueMap)
      setLocations(filteredLocations)
    } catch (err) {
      console.error('Failed to load filtered locations:', err)
      setError('Could not load available locations for selected date')
    }
  }

  if (selectedDate) {
    fetchFilteredLocations()
    setSelectedLocationId(null) // Reset location when date changes
  }
}, [selectedDate])


  const fetchTimeSlots = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/admin/timeslots', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const allSlots = await res.json()

      if (selectedDate && selectedLocationId) {
        const day = format(selectedDate, 'yyyy-MM-dd')
        const filtered = allSlots.filter((slot: TimeSlot) =>
          format(new Date(slot.slotDate.date), 'yyyy-MM-dd') === day &&
          slot.slotDate.location.id === selectedLocationId
        )
        setSlots(filtered)
      }
    } catch (err) {
      console.error(err)
      setError('Failed to fetch slots')
    }
  }

  useEffect(() => {
    if (selectedDate && selectedLocationId) {
      fetchTimeSlots()
    }
  }, [selectedDate, selectedLocationId])

  const handlePriceChange = (id: string, value: string) => {
    setPriceMap((prev) => ({ ...prev, [id]: value }))
  }

  const updatePrice = async (timeSlotId: string) => {
    try {
      setLoading(true)
      setError(null)
      setSuccessMessage(null)
      const token = localStorage.getItem('token')

      const res = await fetch('/api/admin/timeslots/price', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          timeSlotId,
          price: parseInt(priceMap[timeSlotId]),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to update price')
      } else {
        setSuccessMessage('Price updated successfully')
        fetchTimeSlots()
      }
    } catch (err) {
      console.error(err)
      setError('Error updating price')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Set Price Per Time Slot</h1>

      <Card className="p-4 mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
         <select
  className="border p-2 rounded w-full md:w-1/2"
  value={selectedLocationId ?? ''}
  onChange={(e) => setSelectedLocationId(e.target.value || null)}
  disabled={!selectedDate}
>
  <option value="">Select Location</option>
  {locations.map((loc) => (
    <option key={loc.id} value={loc.id}>
      {loc.name}
    </option>
  ))}
</select>
          <DatePicker
            date={selectedDate ?? undefined}
            setDate={(date) => setSelectedDate(date ?? null)}
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {successMessage && (
          <Alert variant="default">
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}
      </Card>

      {slots.length > 0 ? (
        <Card className="p-4 space-y-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
                <TableHead>Current Price</TableHead>
                <TableHead>Update Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {slots.map((slot) => (
                <TableRow key={slot.id}>
                  <TableCell>{format(new Date(slot.startTime), 'hh:mm a')}</TableCell>
                  <TableCell>{format(new Date(slot.endTime), 'hh:mm a')}</TableCell>
                  <TableCell>{slot.price ? `₹${slot.price}` : 'Not set'}</TableCell>
                  <TableCell className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="₹"
                      value={priceMap[slot.id] ?? ''}
                      onChange={(e) => handlePriceChange(slot.id, e.target.value)}
                      className="w-28"
                    />
                    <Button
                      onClick={() => updatePrice(slot.id)}
                      disabled={loading || !priceMap[slot.id]}
                    >
                      Save
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <p className="text-center text-gray-500">No slots available for selected date and location.</p>
      )}
    </div>
  )
}
