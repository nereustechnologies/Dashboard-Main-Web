'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter } from "next/navigation"
import { Input } from '@/components/ui/input'
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Config {
  id: string
  price: number
}

// Cache for price configuration
const cache = {
  config: null as Config | null,
  lastFetch: 0
}

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000

export default function PriceConfig() {
  const [config, setConfig] = useState<Config | null>(null)
  const [loading, setLoading] = useState(false)
  const [isLoadingPrice, setIsLoadingPrice] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [price, setPrice] = useState('')
     const [user, setUser] = useState<any>(null)


    const router = useRouter()
  
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
  

  useEffect(() => {
    const fetchConfig = async () => {
      setIsLoadingPrice(true)
      setError(null)

      try {

        const token = localStorage.getItem("token")
        if (!token) {
          throw new Error("Authentication required")
        }
        // Check cache first
        const now = Date.now()
        const shouldFetch = !cache.config || (now - cache.lastFetch) > CACHE_DURATION

        if (shouldFetch) {
          const response = await fetch('/api/admin/config',{
             headers: {
            Authorization: `Bearer ${token}`,
          },
          })
          if (!response.ok) {
            throw new Error('Failed to fetch price configuration')
          }
          const data = await response.json()
          cache.config = data
          cache.lastFetch = now
          setConfig(data)
          setPrice(data?.price?.toString() || '')
        } else if (cache.config) {
          setConfig(cache.config)
          setPrice(cache.config.price.toString())
        }
      } catch (error) {
        console.error('Error fetching config:', error)
        setError('Failed to load price configuration. Please try again.')
      } finally {
        setIsLoadingPrice(false)
      }
    }

    fetchConfig()
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
      const response = await fetch('/api/admin/config', {
        method: 'PUT',
        headers: {

            Authorization: `Bearer ${token}`,
          
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          price: parseInt(price)
        }),
      })

      if (response.ok) {
        const updatedConfig = await response.json()
        cache.config = updatedConfig
        cache.lastFetch = Date.now()
        setConfig(updatedConfig)
        setEditing(false)
      } else {
        throw new Error('Failed to update price')
      }
    } catch (error) {
      console.error('Error updating price:', error)
      setError('Failed to update price. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Loading skeleton for the price display
  const PriceSkeleton = () => (
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-32" />
      </div>
      <Skeleton className="h-10 w-24" />
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Session Price</h1>
      
      <Card className="p-6">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {editing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Price (₹)</label>
              <Input
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>

            <div className="flex space-x-4">
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? 'Saving...' : 'Save'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setEditing(false)
                  setPrice(config?.price?.toString() || '')
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            {isLoadingPrice ? (
              <PriceSkeleton />
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Current Price</p>
                  <p className="text-2xl font-bold">₹{config?.price || 0}</p>
                </div>
                <Button onClick={() => setEditing(true)}>Edit Price</Button>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  )
} 