"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Cloud, CloudRain, Search, MoreVertical, Droplet } from "lucide-react"

interface WeatherData {
  daily: {
    time: string[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
    precipitation_probability_max: number[]
  }
  hourly: {
    time: string[]
    temperature_2m: number[]
    precipitation_probability: number[]
  }
}

interface WeatherDisplayProps {
  weatherData: WeatherData
}

const WeatherDisplay: React.FC<WeatherDisplayProps> = ({ weatherData }) => {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const currentTemp = weatherData.hourly.temperature_2m[0]
  const currentHour = currentTime.getHours()
  const next4Hours = Array.from({ length: 4 }, (_, i) => (currentHour + i + 1) % 24)

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 max-w-md mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-12">
        <p className="text-gray-300">
          Updated{" "}
          {currentTime.toLocaleString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: false,
          })}{" "}
          · °F
        </p>
        <div className="flex gap-4">
          <Search className="w-6 h-6 text-gray-300" />
          <MoreVertical className="w-6 h-6 text-gray-300" />
        </div>
      </div>

      {/* City and Current Weather */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-wider mb-8">LOS ANGELES</h1>
        <div className="text-8xl font-light mb-4">{Math.round(currentTemp)}°</div>
        <div className="flex justify-center gap-4 text-xl mb-4">
          <span>↑ {Math.round(weatherData.daily.temperature_2m_max[0])}°</span>
          <span>↓ {Math.round(weatherData.daily.temperature_2m_min[0])}°</span>
        </div>
        <div className="text-2xl tracking-widest">OVERCAST</div>
      </div>

      {/* Hourly Forecast */}
      <div className="grid grid-cols-4 gap-4 mb-12 py-8 border-y border-gray-700">
        {next4Hours.map((hour, i) => (
          <div key={hour} className="text-center">
            <div className="mb-2">{hour}:00</div>
            <Cloud className="w-8 h-8 mx-auto mb-2 text-blue-300" />
            <div className="mb-1">{Math.round(weatherData.hourly.temperature_2m[i + 1])}°</div>
            <div className="flex items-center justify-center gap-1 text-sm text-gray-400">
              <Droplet className="w-4 h-4" />
              {weatherData.hourly.precipitation_probability[i + 1]}%
            </div>
          </div>
        ))}
      </div>

      {/* Daily Forecast */}
      <div className="space-y-6">
        {weatherData.daily.time.slice(0, 5).map((date, i) => (
          <div key={date} className="flex items-center justify-between">
            <div className="w-24">
              {i === 0 ? "Today" : new Date(date).toLocaleDateString("en-US", { weekday: "long" })}
            </div>
            <div className="flex items-center gap-2">
              {i === 1 || i === 2 ? (
                <CloudRain className="w-6 h-6 text-blue-300" />
              ) : (
                <Cloud className="w-6 h-6 text-blue-300" />
              )}
              <div className="flex items-center gap-1 w-16">
                <Droplet className="w-4 h-4" />
                {weatherData.daily.precipitation_probability_max[i]}%
              </div>
            </div>
            <div className="w-20 text-right">
              {Math.round(weatherData.daily.temperature_2m_max[i])}°/
              {Math.round(weatherData.daily.temperature_2m_min[i])}°
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default WeatherDisplay
