"use client"

import WeatherDisplay from "@/components/WeatherDisplay"
import { useState, useEffect, useCallback } from "react"

interface Location {
  lat: number
  lon: number
  name: string
}

export default function Home() {
  const [weatherData, setWeatherData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [location, setLocation] = useState<Location>({ lat: 34.0522, lon: -118.2437, name: "Los Angeles" })

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

  const reverseGeocode = async (lat: number, lon: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
      const data = await res.json()
      return data.address.city || data.address.town || data.address.village || "Unknown Location"
    } catch (error) {
      console.error("Error reverse geocoding:", error)
      return "Unknown Location"
    }
  }

  useEffect(() => {
    fetchWeatherData(location.lat, location.lon)
  }, [location, fetchWeatherData])

  const handleLocationUpdate = async (lat: number, lon: number) => {
    const cityName = await reverseGeocode(lat, lon)
    setLocation({ lat, lon, name: cityName })
  }

  const handleSearch = async (query: string) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`)
      const data = await res.json()
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0]
        setLocation({ lat: Number.parseFloat(lat), lon: Number.parseFloat(lon), name: display_name.split(",")[0] })
      } else {
        alert("Location not found. Please try again.")
      }
    } catch (error) {
      console.error("Error searching for location:", error)
      alert("Error searching for location. Please try again.")
    }
  }

  if (loading || !weatherData) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading...</div>
  }

  return (
    <main className="bg-black">
      <WeatherDisplay
        weatherData={weatherData}
        onLocationUpdate={handleLocationUpdate}
        cityName={location.name}
        onSearch={handleSearch}
      />
    </main>
  )
}
