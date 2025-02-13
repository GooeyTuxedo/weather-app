"use client"

import WeatherDisplay from "@/components/WeatherDisplay"
import { useState, useEffect, useCallback } from "react"
import { getLocalStorageItem, setLocalStorageItem } from "./utils/localStorage"

export default function Home() {
  const [weatherData, setWeatherData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [location, setLocation] = useState(() => ({
    lat: Number.parseFloat(getLocalStorageItem("weatherLat") || "34.0522"),
    lon: Number.parseFloat(getLocalStorageItem("weatherLon") || "-118.2437"),
    name: getLocalStorageItem("weatherCity") || "Los Angeles",
  }))

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
  }, [location.lat, location.lon, fetchWeatherData])

  const handleLocationUpdate = async (lat: number, lon: number, cityName: string) => {
    setLocation((prev) => {
      if (prev.lat === lat && prev.lon === lon) return prev
      setLocalStorageItem("weatherLat", lat.toString())
      setLocalStorageItem("weatherLon", lon.toString())
      setLocalStorageItem("weatherCity", cityName)
      return { lat, lon, name: cityName }
    })
  }

  const handleSearch = async (query: string) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`)
      const data = await res.json()
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0]
        setLocation((prev) => {
          if (prev.lat === Number.parseFloat(lat) && prev.lon === Number.parseFloat(lon)) return prev
          setLocalStorageItem("weatherLat", lat)
          setLocalStorageItem("weatherLon", lon)
          setLocalStorageItem("weatherCity", display_name.split(",")[0])
          return { lat: Number.parseFloat(lat), lon: Number.parseFloat(lon), name: display_name.split(",")[0] }
        })
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
