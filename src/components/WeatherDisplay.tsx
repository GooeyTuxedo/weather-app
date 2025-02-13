"use client"

import { Search, MoreVertical, Droplet, Cloud, MapPin } from "lucide-react"
import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import type React from "react"
import { debounce } from "lodash"
import Settings from "./Settings"
import { WeatherDetails } from "./WeatherDetails"
import { createDateInTimezone } from "@/app/utils/dateUtils"
import { weatherCodeToIcon, weatherCodeToLabel } from "@/app/utils/weatherCodes"
import { setLocalStorageItem, getLocalStorageItem } from "@/app/utils/localStorage"
import type { WeatherData, HourlyData } from "@/types/weather"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface WeatherDisplayProps {
  weatherData: WeatherData
  onLocationUpdate: (lat: number, lon: number, cityName: string) => Promise<void>
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

interface SearchResult {
  name: string
  country: string
  lat: number
  lon: number
}

const WeatherDisplay: React.FC<WeatherDisplayProps> = ({ weatherData, onLocationUpdate, cityName }) => {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showSettings, setShowSettings] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [units, setUnits] = useState<"metric" | "imperial">(() => {
    const savedUnits = getLocalStorageItem("weatherUnits")
    return savedUnits === "metric" ? "metric" : "imperial"
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

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

      await onLocationUpdate(position.coords.latitude, position.coords.longitude, "Current Location")
      setLocalStorageItem("weatherLat", position.coords.latitude.toString())
      setLocalStorageItem("weatherLon", position.coords.longitude.toString())
      setLocalStorageItem("weatherCity", "Current Location")
      setShowSearch(false)
    } catch (error) { /* eslint-disable-line @typescript-eslint/no-unused-vars */
      alert("Error getting location. Please try again.")
    }
  }

  const debouncedSearch = useMemo(
    () =>
      debounce(async (query: string) => {
        if (query.length < 2) {
          setSearchResults([])
          return
        }
        setIsSearching(true)
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`,
          )
          const data = await response.json()
          setSearchResults(
            data.map((item: { display_name: string, lat: string, lon: string}) => ({
              name: item.display_name.split(",")[0],
              country: item.display_name.split(",").slice(-1)[0].trim(),
              lat: Number.parseFloat(item.lat),
              lon: Number.parseFloat(item.lon),
            })),
          )
        } catch (error) {
          console.error("Error searching for location:", error)
        } finally {
          setIsSearching(false)
        }
      }, 300),
    [],
  )

  useEffect(() => {
    debouncedSearch(searchQuery)
    return () => {
      debouncedSearch.cancel()
    }
  }, [searchQuery, debouncedSearch])

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleSearchSelect = async (result: SearchResult) => {
    await onLocationUpdate(result.lat, result.lon, result.name)
    setLocalStorageItem("weatherLat", result.lat.toString())
    setLocalStorageItem("weatherLon", result.lon.toString())
    setLocalStorageItem("weatherCity", result.name)
    setShowSearch(false)
    setSearchQuery("")
    setSearchResults([])
  }

  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [showSearch])

  const hourlyForecast = useMemo(() => {
    const currentHourIndex = combinedHourlyData.findIndex((data) => data.time.getHours() === currentTime.getHours())
    return combinedHourlyData.slice(currentHourIndex, currentHourIndex + 24)
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

      {/* Search Panel */}
      {showSearch && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <div className="flex items-center gap-2 mb-4">
              <Input
                type="text"
                value={searchQuery}
                onChange={handleSearchInputChange}
                placeholder="Search city..."
                className="flex-grow"
                ref={searchInputRef}
              />
              <Button onClick={handleLocationUpdate}>
                <MapPin className="h-[1.2rem] w-[1.2rem]" />
              </Button>
            </div>
            {isSearching && <div className="text-center">Searching...</div>}
            {!isSearching && searchResults.length > 0 && (
              <ul className="max-h-60 overflow-auto">
                {searchResults.map((result, index) => (
                  <li
                    key={index}
                    className="p-2 hover:bg-gray-700 cursor-pointer"
                    onClick={() => handleSearchSelect(result)}
                  >
                    {result.name}, {result.country}
                  </li>
                ))}
              </ul>
            )}
            <Button variant="ghost" onClick={() => setShowSearch(false)} className="mt-4">
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="lg:flex lg:gap-8">
        <div className="lg:w-1/2">
          {/* City and Current Weather */}
          <div className="text-center mb-12 lg:text-left">
            <h1 className="text-4xl font-bold tracking-wider mb-8">{cityName.toUpperCase()}</h1>
            <div className="lg:flex lg:items-center lg:gap-8">
              <CurrentWeatherIcon className="w-24 h-24 mx-auto mb-4 text-blue-300 lg:mx-0" />
              <div>
                <div className="text-8xl font-light mb-4">{formatTemperature(currentHourData.temperature)}°</div>
                <div className="flex justify-center gap-4 text-xl mb-4 lg:justify-start">
                  <span>↑ {formatTemperature(weatherData.daily.temperature_2m_max[0])}°</span>
                  <span>↓ {formatTemperature(weatherData.daily.temperature_2m_min[0])}°</span>
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
        </div>

        <div className="lg:w-1/2">
          {/* Daily Forecast */}
          <div className="space-y-6 mb-12">
            <h2 className="text-2xl font-semibold mb-4">7-Day Forecast</h2>
            {weatherData.daily.time.map((date, i) => {
              const DailyIcon = getDayIcon(weatherData.daily.weathercode[i])
              return (
                <div key={date} className="flex items-center justify-between">
                  <div className="w-24">
                    {i === 0
                      ? "Today"
                      : createDateInTimezone(date, weatherData.timezone).toLocaleDateString("en-US", {
                          weekday: "long",
                        })}
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
      </div>
    </div>
  )
}

export default WeatherDisplay
