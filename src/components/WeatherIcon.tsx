import { Cloud, type LucideIcon } from "lucide-react"
import { weatherCodeToIcon } from "@/lib/weatherCodes"
import { isDaytime } from "@/lib/weatherUtils"

interface WeatherIconProps {
  weatherCode: number
  time: Date
  sunrise: number
  sunset: number
  timezone: string
  className?: string
}

export function WeatherIcon({ weatherCode, time, sunrise, sunset, timezone, className }: WeatherIconProps) {
  const iconSet = weatherCodeToIcon[weatherCode] || { day: Cloud, night: Cloud }
  const isDay = isDaytime(time, sunrise, sunset, timezone)
  const Icon: LucideIcon = isDay ? iconSet.day : iconSet.night

  return <Icon className={className} />
}
