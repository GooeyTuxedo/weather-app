"use client"

import WeatherDisplay from "@/components/WeatherDisplay"
import { useState, useEffect, useCallback } from "react"

export default function Home() {
  const [weatherData, setWeatherData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [location, setLocation] = useState({ lat: 34.0522, lon: -118.2437 }) // Default to LA

  const fetchWeatherData = useCallback(async (lat: number, lon: number) => {
    try {
      setLoading(true)
      const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`)
      if (!res.ok) throw new Error("Failed to fetch weather data")
      const data = await res.json()
      setWeatherData(data)
    } catch (error) {
      console.error("Error fetching weather data:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchWeatherData(location.lat, location.lon)
  }, [location, fetchWeatherData])

  const handleLocationUpdate = async (lat: number, lon: number) => {
    setLocation({ lat, lon })
  }

  if (loading || !weatherData) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading...</div>
  }

  return (
    <main>
      <WeatherDisplay weatherData={weatherData} onLocationUpdate={handleLocationUpdate} />
    </main>
  )
}
