"use client"

import { useState, useEffect, useCallback } from "react"
import type { WeatherData } from "@/types/weather"
import { getLocalStorageItem, setLocalStorageItem } from "@/lib/localStorage"

export function useWeather() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
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
      if (prev.lat === lat && prev.lon === lon && prev.name === cityName) return prev
      setLocalStorageItem("weatherLat", lat.toString())
      setLocalStorageItem("weatherLon", lon.toString())
      setLocalStorageItem("weatherCity", cityName)
      return { lat, lon, name: cityName }
    })
  }

  return { weatherData, loading, location, handleLocationUpdate }
}
