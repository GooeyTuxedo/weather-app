"use client"

import { Search, MoreVertical, Droplet } from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { WeatherDetails } from "./WeatherDetails"
import { WeatherIcon } from "./WeatherIcon"
import { SearchPanel } from "./SearchPanel"
import { Settings } from "./Settings"
import { useWeather } from "@/hooks/useWeather"
import { useWeatherSearch } from "@/hooks/useWeatherSearch"
import { combineHourlyData, getCurrentHourData, formatTemperature } from "@/lib/weatherUtils"
import { createDateInTimezone } from "@/lib/dateUtils"
import { weatherCodeToLabel } from "@/lib/weatherCodes"
import { setLocalStorageItem, getLocalStorageItem } from "@/lib/localStorage"

export default function WeatherDisplay() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showSettings, setShowSettings] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [units, setUnits] = useState<"metric" | "imperial">(() => {
    const savedUnits = getLocalStorageItem("weatherUnits")
    return savedUnits === "metric" ? "metric" : "imperial"
  })

  const { weatherData, loading, location, handleLocationUpdate } = useWeather()
  const { searchQuery, setSearchQuery, searchResults, isSearching, handleSearchInputChange } = useWeatherSearch()

  useEffect(() => {
    if (!weatherData) return
    const timer = setInterval(() => {
      setCurrentTime(createDateInTimezone(Date.now() / 1000, weatherData.timezone))
    }, 1000)
    return () => clearInterval(timer)
  }, [weatherData])

  useEffect(() => {
    setLocalStorageItem("weatherUnits", units)
  }, [units])

  const combinedHourlyData = useMemo(() => {
    if (!weatherData) return []
    return combineHourlyData(weatherData.hourly, weatherData.timezone)
  }, [weatherData])

  const currentHourData = useMemo(() => getCurrentHourData(combinedHourlyData), [combinedHourlyData])

  const hourlyForecast = useMemo(() => {
    const currentHourIndex = combinedHourlyData.findIndex((data) => data.time.getHours() === currentTime.getHours())
    return combinedHourlyData.slice(currentHourIndex, currentHourIndex + 24)
  }, [combinedHourlyData, currentTime])

  if (loading || !weatherData) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8 lg:p-12 max-w-7xl mx-auto">
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
          <Button variant="ghost" size="icon" onClick={() => setShowSearch(true)}>
            <Search className="h-[1.2rem] w-[1.2rem]" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setShowSettings(true)}>
            <MoreVertical className="h-[1.2rem] w-[1.2rem]" />
          </Button>
        </div>
      </div>

      <div className="lg:flex lg:gap-8">
        <div className="lg:w-1/2">
          {/* City and Current Weather */}
          <div className="text-center mb-12 lg:text-left">
            <h1 className="text-4xl font-bold tracking-wider mb-8">{location.name.toUpperCase()}</h1>
            <div className="lg:flex lg:items-center lg:gap-8">
              <WeatherIcon
                weatherCode={currentHourData.weathercode}
                time={currentTime}
                sunrise={weatherData.daily.sunrise[0]}
                sunset={weatherData.daily.sunset[0]}
                timezone={weatherData.timezone}
                className="w-24 h-24 mx-auto mb-4 text-blue-300 lg:mx-0"
              />
              <div>
                <div className="text-8xl font-light mb-4">{formatTemperature(currentHourData.temperature, units)}°</div>
                <div className="flex justify-center gap-4 text-xl mb-4 lg:justify-start">
                  <span>↑ {formatTemperature(weatherData.daily.temperature_2m_max[0], units)}°</span>
                  <span>↓ {formatTemperature(weatherData.daily.temperature_2m_min[0], units)}°</span>
                </div>
                <div className="text-2xl tracking-widest">
                  {weatherCodeToLabel[currentHourData.weathercode] || "Unknown"}
                </div>
              </div>
            </div>
          </div>

          {/* Hourly Forecast */}
          <div className="mb-12 py-8 border-y border-gray-700 overflow-x-auto">
            <div className="flex gap-4" style={{ width: `${hourlyForecast.length * 5}rem` }}>
              {hourlyForecast.map((hourData) => (
                <div key={hourData.time.toISOString()} className="text-center w-20 flex-shrink-0">
                  <div className="mb-2">{hourData.time.getHours()}:00</div>
                  <WeatherIcon
                    weatherCode={hourData.weathercode}
                    time={hourData.time}
                    sunrise={weatherData.daily.sunrise[0]}
                    sunset={weatherData.daily.sunset[0]}
                    timezone={weatherData.timezone}
                    className="w-8 h-8 mx-auto mb-2 text-blue-300"
                  />
                  <div className="mb-1">{formatTemperature(hourData.temperature, units)}°</div>
                  <div className="flex items-center justify-center gap-1 text-sm text-gray-400">
                    <Droplet className="w-4 h-4" />
                    {hourData.precipitation}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:w-1/2">
          {/* Daily Forecast */}
          <div className="space-y-6 mb-12">
            <h2 className="text-2xl font-semibold mb-4">7-Day Forecast</h2>
            {weatherData.daily.time.map((date, i) => (
              <div key={date} className="flex items-center justify-between">
                <div className="w-24">
                  {i === 0
                    ? "Today"
                    : createDateInTimezone(date, weatherData.timezone).toLocaleDateString("en-US", { weekday: "long" })}
                </div>
                <div className="flex items-center gap-2">
                  <WeatherIcon
                    weatherCode={weatherData.daily.weathercode[i]}
                    time={createDateInTimezone(date, weatherData.timezone)}
                    sunrise={weatherData.daily.sunrise[i]}
                    sunset={weatherData.daily.sunset[i]}
                    timezone={weatherData.timezone}
                    className="w-6 h-6 text-blue-300"
                  />
                  <div className="flex items-center gap-1 w-16">
                    <Droplet className="w-4 h-4" />
                    {weatherData.daily.precipitation_probability_max[i]}%
                  </div>
                </div>
                <div className="w-20 text-right">
                  {formatTemperature(weatherData.daily.temperature_2m_max[i], units)}°/
                  {formatTemperature(weatherData.daily.temperature_2m_min[i], units)}°
                </div>
              </div>
            ))}
          </div>

          {/* Weather Details */}
          <WeatherDetails
            currentHourData={currentHourData}
            sunrise={weatherData.daily.sunrise[0]}
            sunset={weatherData.daily.sunset[0]}
            timezone={weatherData.timezone}
            units={units}
          />
        </div>
      </div>

      {/* Search Panel */}
      {showSearch && (
        <SearchPanel
          searchQuery={searchQuery}
          isSearching={isSearching}
          searchResults={searchResults}
          onSearchInputChange={handleSearchInputChange}
          onLocationUpdate={async () => {
            if (!navigator.geolocation) {
              alert("Geolocation is not supported by your browser")
              return
            }
            try {
              const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject)
              })
              await handleLocationUpdate(position.coords.latitude, position.coords.longitude, "Current Location")
              setShowSearch(false)
            } catch (error) { /* eslint-disable-line @typescript-eslint/no-unused-vars */
              alert("Error getting location. Please try again.")
            }
          }}
          onSearchSelect={async (result) => {
            await handleLocationUpdate(result.lat, result.lon, result.name)
            setShowSearch(false)
            setSearchQuery("")
          }}
          onClose={() => setShowSearch(false)}
        />
      )}

      {/* Settings Panel */}
      {showSettings && (
        <Settings
          onClose={() => setShowSettings(false)}
          units={units}
          onUnitsChange={(newUnits) => {
            setUnits(newUnits)
            setLocalStorageItem("weatherUnits", newUnits)
          }}
          onLocationUpdate={async () => {
            if (!navigator.geolocation) {
              alert("Geolocation is not supported by your browser")
              return
            }
            try {
              const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject)
              })
              await handleLocationUpdate(position.coords.latitude, position.coords.longitude, "Current Location")
              setShowSettings(false)
            } catch (error) { /* eslint-disable-line @typescript-eslint/no-unused-vars */
              alert("Error getting location. Please try again.")
            }
          }}
        />
      )}
    </div>
  )
}
