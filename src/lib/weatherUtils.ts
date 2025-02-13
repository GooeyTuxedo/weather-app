import type { HourlyData, WeatherData } from "@/types/weather"
import { createDateInTimezone } from "./dateUtils"

export function combineHourlyData(data: WeatherData["hourly"], timezone: string): HourlyData[] {
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

export function getCurrentHourData(combinedData: HourlyData[]): HourlyData {
  const now = new Date()
  return combinedData.find((data) => data.time.getHours() === now.getHours()) || combinedData[0]
}

export function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9) / 5 + 32
}

export function formatTemperature(celsius: number, units: "metric" | "imperial"): number {
  const temp = units === "imperial" ? celsiusToFahrenheit(celsius) : celsius
  return Math.round(temp)
}

export function isDaytime(currentTime: Date, sunrise: number, sunset: number, timezone: string): boolean {
  const sunriseTime = createDateInTimezone(sunrise, timezone)
  const sunsetTime = createDateInTimezone(sunset, timezone)

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
}
