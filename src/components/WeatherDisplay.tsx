"use client"

import { Cloud, MoreVertical, Droplet } from "lucide-react"
import { useState, useEffect, useMemo, useCallback } from "react"
import type React from "react"
import Settings from "@/components/Settings"
import { createDateInTimezone } from "@/app/utils/dateUtils"
import { weatherCodeToIcon, weatherCodeToLabel } from "@/app/utils/weatherCodes"
import { WeatherData, HourlyData } from "@/types/weather"
import { setLocalStorageItem, getLocalStorageItem } from "@/app/utils/localStorage"
import { WeatherDetails } from "@/components/WeatherDetails"

interface WeatherDisplayProps {
  weatherData: WeatherData
  onLocationUpdate: (lat: number, lon: number) => Promise<void>
  cityName: string
  onSearch: (query: string) => Promise<void>
}

const combineHourlyData = (data: WeatherData["hourly"], timezone: string): HourlyData[] => {
  return data.time.map((time, index) => ({
    time: createDateInTimezone(time, timezone),
    temperature: data.temperature_2m[index],
    precipitation: data.precipitation_probability[index],
    weathercode: data.weathercode[index],
    apparent_temperature: data.apparent_temperature[index],
    windspeed_10m: data.windspeed_10m[index],
    cloudcover: data.cloudcover[index],
    uv_index: data.uv_index[index],
    relative_humidity_2m: data.relative_humidity_2m[index],
    pressure_msl: data.pressure_msl[index],
  }))
}

const getCurrentHourData = (combinedData: HourlyData[]) => {
  const now = new Date()
  return combinedData.find((data) => data.time.getHours() === now.getHours()) || combinedData[0]
}

const WeatherDisplay: React.FC<WeatherDisplayProps> = ({ weatherData, onLocationUpdate, cityName, onSearch }) => {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showSettings, setShowSettings] = useState(false)
  const [units, setUnits] = useState<"metric" | "imperial">(() => {
    const savedUnits = getLocalStorageItem("weatherUnits")
    return savedUnits === "metric" ? "metric" : "imperial"
  })
  const [searchQuery, setSearchQuery] = useState("")

  const combinedHourlyData = useMemo(
    () => combineHourlyData(weatherData.hourly, weatherData.timezone),
    [weatherData.hourly, weatherData.timezone],
  )
  const currentHourData = useMemo(() => getCurrentHourData(combinedHourlyData), [combinedHourlyData])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(createDateInTimezone(Date.now() / 1000, weatherData.timezone))
    }, 1000)
    return () => clearInterval(timer)
  }, [weatherData.timezone])

  useEffect(() => {
    setLocalStorageItem("weatherUnits", units)
  }, [units])

  const celsiusToFahrenheit = (celsius: number) => {
    return (celsius * 9) / 5 + 32
  }

  const formatTemperature = (celsius: number) => {
    const temp = units === "imperial" ? celsiusToFahrenheit(celsius) : celsius
    return Math.round(temp)
  }

  const handleLocationUpdate = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser")
      return
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject)
      })

      await onLocationUpdate(position.coords.latitude, position.coords.longitude)
      setLocalStorageItem("weatherLat", position.coords.latitude.toString())
      setLocalStorageItem("weatherLon", position.coords.longitude.toString())
    } catch (error) { /* eslint-disable-line @typescript-eslint/no-unused-vars */
      alert("Error getting location. Please try again.")
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(searchQuery)
    setSearchQuery("")
  }

  const hourlyForecast = useMemo(() => {
    const currentHourIndex = combinedHourlyData.findIndex((data) => data.time.getHours() === currentTime.getHours())
    return combinedHourlyData.slice(currentHourIndex + 1, currentHourIndex + 37)
  }, [combinedHourlyData, currentTime])

  const isDaytime = useCallback(
    (currentTime: Date, sunrise: number, sunset: number): boolean => {
      const sunriseTime = createDateInTimezone(sunrise, weatherData.timezone)
      const sunsetTime = createDateInTimezone(sunset, weatherData.timezone)

      // Normalize all times to the same day for comparison
      const normalizeTime = (time: Date) => {
        const normalized = new Date(time)
        normalized.setFullYear(2000, 0, 1)
        return normalized
      }

      const normalizedCurrentTime = normalizeTime(currentTime)
      const normalizedSunrise = normalizeTime(sunriseTime)
      const normalizedSunset = normalizeTime(sunsetTime)

      if (normalizedSunrise < normalizedSunset) {
        // Standard case: sunrise comes before sunset
        return normalizedCurrentTime >= normalizedSunrise && normalizedCurrentTime < normalizedSunset
      } else {
        // Edge case: sunrise is after sunset (e.g., near poles)
        return normalizedCurrentTime >= normalizedSunrise || normalizedCurrentTime < normalizedSunset
      }
    },
    [weatherData.timezone],
  )


  const getWeatherIcon = useCallback(
    (weatherCode: number, time: Date) => {
      const iconSet = weatherCodeToIcon[weatherCode] || { day: Cloud, night: Cloud }
      const isDay = isDaytime(time, weatherData.daily.sunrise[0], weatherData.daily.sunset[0])
      return isDay ? iconSet.day : iconSet.night
    },
    [weatherData.daily.sunrise, weatherData.daily.sunset, isDaytime],
  )

  const getDayIcon = useCallback((weatherCode: number) => {
    const iconSet = weatherCodeToIcon[weatherCode] || { day: Cloud, night: Cloud }
    return iconSet.day
  }, [])

  if (showSettings) {
    return (
      <Settings
        onClose={() => setShowSettings(false)}
        units={units}
        onUnitsChange={(newUnits) => {
          setUnits(newUnits)
          setLocalStorageItem("weatherUnits", newUnits)
        }}
        onLocationUpdate={handleLocationUpdate}
      />
    )
  }

  const CurrentWeatherIcon = getWeatherIcon(currentHourData.weathercode, currentTime)

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
            timeZone: weatherData.timezone,
          })}{" "}
          · {units === "imperial" ? "°F" : "°C"}
        </p>
        <div className="flex gap-4">
          <form onSubmit={handleSearch}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search city..."
              className="bg-gray-800 text-white px-2 py-1 rounded"
            />
          </form>
          <button onClick={() => setShowSettings(true)}>
            <MoreVertical className="w-6 h-6 text-gray-300" />
          </button>
        </div>
      </div>

      {/* City and Current Weather */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-wider mb-8">{cityName.toUpperCase()}</h1>
        <CurrentWeatherIcon className="w-24 h-24 mx-auto mb-4 text-blue-300" />
        <div className="text-8xl font-light mb-4">{formatTemperature(currentHourData.temperature)}°</div>
        <div className="flex justify-center gap-4 text-xl mb-4">
          <span>↑ {formatTemperature(weatherData.daily.temperature_2m_max[0])}°</span>
          <span>↓ {formatTemperature(weatherData.daily.temperature_2m_min[0])}°</span>
        </div>
        <div className="text-2xl tracking-widest">{weatherCodeToLabel[currentHourData.weathercode] || "Unknown"}</div>
      </div>

      {/* Hourly Forecast */}
      <div className="mb-12 py-8 border-y border-gray-700 overflow-x-auto">
        <div className="flex gap-4" style={{ width: `${hourlyForecast.length * 5}rem` }}>
          {hourlyForecast.map((hourData) => {
            const HourlyIcon = getWeatherIcon(hourData.weathercode, hourData.time)
            return (
              <div key={hourData.time.toISOString()} className="text-center w-20 flex-shrink-0">
                <div className="mb-2">{hourData.time.getHours()}:00</div>
                <HourlyIcon className="w-8 h-8 mx-auto mb-2 text-blue-300" />
                <div className="mb-1">{formatTemperature(hourData.temperature)}°</div>
                <div className="flex items-center justify-center gap-1 text-sm text-gray-400">
                  <Droplet className="w-4 h-4" />
                  {hourData.precipitation}%
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Daily Forecast */}
      <div className="space-y-6">
        {weatherData.daily.time.map((date, i) => {
          const DailyIcon = getDayIcon(weatherData.daily.weathercode[i])
          return (
            <div key={date} className="flex items-center justify-between">
              <div className="w-24">
                {i === 0
                  ? "Today"
                  : createDateInTimezone(date, weatherData.timezone).toLocaleDateString("en-US", { weekday: "long" })}
              </div>
              <div className="flex items-center gap-2">
                <DailyIcon className="w-6 h-6 text-blue-300" />
                <div className="flex items-center gap-1 w-16">
                  <Droplet className="w-4 h-4" />
                  {weatherData.daily.precipitation_probability_max[i]}%
                </div>
              </div>
              <div className="w-20 text-right">
                {formatTemperature(weatherData.daily.temperature_2m_max[i])}°/
                {formatTemperature(weatherData.daily.temperature_2m_min[i])}°
              </div>
            </div>
          )
        })}
      </div>

      {/* Weather Details */}
      <WeatherDetails
        currentHourData={currentHourData}
        sunrise={weatherData.daily.sunrise[0]}
        sunset={weatherData.daily.sunset[0]}
        timezone={weatherData.timezone}
        formatTemperature={formatTemperature}
      />
    </div>
  )
}

export default WeatherDisplay

