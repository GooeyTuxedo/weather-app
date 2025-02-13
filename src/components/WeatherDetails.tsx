import { Wind, Droplets, Sun, Cloud, Sunrise, Sunset, Gauge } from "lucide-react"
import type { HourlyData } from "@/types/weather"
import { formatTime } from "@/lib/dateUtils"
import { formatTemperature } from "@/lib/weatherUtils"

interface WeatherDetailsProps {
  currentHourData: HourlyData
  sunrise: number
  sunset: number
  timezone: string
  units: "metric" | "imperial"
}

export function WeatherDetails({ currentHourData, sunrise, sunset, timezone, units }: WeatherDetailsProps) {
  return (
    <div className="mt-8 space-y-8">
      <h2 className="text-2xl font-semibold mb-4">Weather Details</h2>
      <div className="grid grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 text-gray-400 mb-1">
            <Droplets className="w-4 h-4" />
            Feels like
          </div>
          <div className="text-2xl">{formatTemperature(currentHourData.apparent_temperature, units)}°</div>
        </div>

        <div>
          <div className="flex items-center gap-2 text-gray-400 mb-1">
            <Droplets className="w-4 h-4" />
            Humidity
          </div>
          <div className="text-2xl">{Math.round(currentHourData.relative_humidity_2m)}%</div>
        </div>

        <div>
          <div className="flex items-center gap-2 text-gray-400 mb-1">
            <Wind className="w-4 h-4" />
            Wind speed
          </div>
          <div className="text-2xl">{Math.round(currentHourData.windspeed_10m)} mph</div>
        </div>

        <div>
          <div className="flex items-center gap-2 text-gray-400 mb-1">
            <Cloud className="w-4 h-4" />
            Clouds
          </div>
          <div className="text-2xl">{Math.round(currentHourData.cloudcover)}%</div>
        </div>

        <div>
          <div className="flex items-center gap-2 text-gray-400 mb-1">
            <Sun className="w-4 h-4" />
            UV index
          </div>
          <div className="text-2xl">{currentHourData.uv_index.toFixed(1)}</div>
        </div>

        <div>
          <div className="flex items-center gap-2 text-gray-400 mb-1">
            <Droplets className="w-4 h-4" />
            Rain chance
          </div>
          <div className="text-2xl">{currentHourData.precipitation}%</div>
        </div>

        <div>
          <div className="flex items-center gap-2 text-gray-400 mb-1">
            <Sunrise className="w-4 h-4" />
            Sunrise
          </div>
          <div className="text-2xl">{formatTime(sunrise, timezone)}</div>
        </div>

        <div>
          <div className="flex items-center gap-2 text-gray-400 mb-1">
            <Sunset className="w-4 h-4" />
            Sunset
          </div>
          <div className="text-2xl">{formatTime(sunset, timezone)}</div>
        </div>

        <div>
          <div className="flex items-center gap-2 text-gray-400 mb-1">
            <Gauge className="w-4 h-4" />
            Pressure
          </div>
          <div className="text-2xl">{Math.round(currentHourData.pressure_msl)} hPa</div>
        </div>
      </div>

      <div className="h-px bg-gray-800" />

      <div className="text-center text-sm text-gray-400">
        Weather data by{" "}
        <a
          href="https://open-meteo.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-300"
        >
          Open-Meteo
        </a>
      </div>
    </div>
  )
}
