import { Sun, Cloud, CloudDrizzle, CloudRain, CloudSnow, CloudFog, CloudLightning, LucideIcon } from "lucide-react"

export const weatherCodeToIcon: { [key: number]: LucideIcon } = {
  0: Sun, // Clear sky
  1: Sun, // Mainly clear
  2: Cloud, // Partly cloudy
  3: Cloud, // Overcast
  45: CloudFog, // Fog
  48: CloudFog, // Depositing rime fog
  51: CloudDrizzle, // Light drizzle
  53: CloudDrizzle, // Moderate drizzle
  55: CloudDrizzle, // Dense drizzle
  56: CloudDrizzle, // Light freezing drizzle
  57: CloudDrizzle, // Dense freezing drizzle
  61: CloudRain, // Slight rain
  63: CloudRain, // Moderate rain
  65: CloudRain, // Heavy rain
  66: CloudRain, // Light freezing rain
  67: CloudRain, // Heavy freezing rain
  71: CloudSnow, // Slight snow fall
  73: CloudSnow, // Moderate snow fall
  75: CloudSnow, // Heavy snow fall
  77: CloudSnow, // Snow grains
  80: CloudRain, // Slight rain showers
  81: CloudRain, // Moderate rain showers
  82: CloudRain, // Violent rain showers
  85: CloudSnow, // Slight snow showers
  86: CloudSnow, // Heavy snow showers
  95: CloudLightning, // Thunderstorm
  96: CloudLightning, // Thunderstorm with slight hail
  99: CloudLightning, // Thunderstorm with heavy hail
}

export const weatherCodeToLabel: { [key: number]: string } = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  56: "Light freezing drizzle",
  57: "Dense freezing drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  66: "Light freezing rain",
  67: "Heavy freezing rain",
  71: "Slight snow fall",
  73: "Moderate snow fall",
  75: "Heavy snow fall",
  77: "Snow grains",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  85: "Slight snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail",
}

