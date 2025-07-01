'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { startOfDay, format } from 'date-fns'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { DatePicker } from '@/components/ui/date-picker'
import { Table, TableHead, TableHeader, TableRow, TableCell, TableBody } from '@/components/ui/table'

interface SlotDate {
  id: string
  date: string
  price: number
}

export default function SlotDatePriceConfig() {
  const [dates, setDates] = useState<SlotDate[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [price, setPrice] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [filterDate, setFilterDate] = useState<Date | null>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (!token || !userData) return router.push('/login')

    const parsedUser = JSON.parse(userData)
    if (parsedUser.role !== 'admin') return router.push('/login')
  }, [router])

  const fetchPrices = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/admin/slotdate', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setDates(data)
    } catch (err) {
      console.error(err)
      setError('Failed to fetch date prices')
    }
  }

  useEffect(() => {
    fetchPrices()
  }, [])

  const handleSubmit = async () => {
    if (!selectedDate) return
    try {
      setLoading(true)
      setError(null)
      setSuccessMessage(null)

      const token = localStorage.getItem('token')
      const res = await fetch('/api/admin/slotdate', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
         date: format(selectedDate, 'yyyy-MM-dd'), // ✅ Send as plain date string

          price: parseInt(price),
        }),
      })

      const responseData = await res.json()

      if (!res.ok) {
        setError(responseData.error || 'Failed to update')
      } else {
        setSuccessMessage(responseData.message || 'Price updated successfully')
        setPrice('')
        setSelectedDate(null)
        fetchPrices()
      }
    } catch (err) {
      console.error(err)
      setError('Failed to update price')
    } finally {
      setLoading(false)
    }
  }

  const filteredDates = filterDate
    ? dates.filter(
        (d) =>
          startOfDay(new Date(d.date)).toISOString() ===
          startOfDay(filterDate).toISOString()
      )
    : dates

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Manage Date-wise Session Price</h1>

      <Card className="p-4 mb-6 space-y-4">
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

        <DatePicker
          date={selectedDate ?? undefined}
          setDate={(date) => setSelectedDate(date ?? null)}
        />

        <Input
          placeholder="Enter price (₹)"
          value={price}
          type="number"
          onChange={(e) => setPrice(e.target.value)}
        />

        <Button onClick={handleSubmit} disabled={loading || !selectedDate || !price}>
          {loading ? 'Saving...' : 'Save Price for Date'}
        </Button>
      </Card>

      {/* Filter */}
      <div className="mb-4 space-y-1">
        <label className="text-sm font-medium">Filter by Date</label>
        <DatePicker
          date={filterDate ?? undefined}
          setDate={(date) => setFilterDate(date ?? null)}
        />
        {filterDate && (
          <Button
            variant="ghost"
            className="text-sm px-2"
            onClick={() => setFilterDate(null)}
          >
            Clear Filter
          </Button>
        )}
      </div>

      <Card className="p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Price (₹)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDates.length > 0 ? (
              filteredDates.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>{format(new Date(d.date), 'yyyy-MM-dd')}</TableCell>
                  <TableCell>{d.price}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} className="text-center">
                  No data available for selected date
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
