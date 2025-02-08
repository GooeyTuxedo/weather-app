import { Sun, Moon, Cloud, CloudDrizzle, CloudRain, CloudSnow, CloudFog, CloudLightning } from "lucide-react"
import type { LucideIcon } from "lucide-react"

export const weatherCodeToIcon: { [key: number]: { day: LucideIcon; night: LucideIcon } } = {
  0: { day: Sun, night: Moon }, // Clear sky
  1: { day: Sun, night: Moon }, // Mainly clear
  2: { day: Cloud, night: Cloud }, // Partly cloudy
  3: { day: Cloud, night: Cloud }, // Overcast
  45: { day: CloudFog, night: CloudFog }, // Fog
  48: { day: CloudFog, night: CloudFog }, // Depositing rime fog
  51: { day: CloudDrizzle, night: CloudDrizzle }, // Light drizzle
  53: { day: CloudDrizzle, night: CloudDrizzle }, // Moderate drizzle
  55: { day: CloudDrizzle, night: CloudDrizzle }, // Dense drizzle
  56: { day: CloudDrizzle, night: CloudDrizzle }, // Light freezing drizzle
  57: { day: CloudDrizzle, night: CloudDrizzle }, // Dense freezing drizzle
  61: { day: CloudRain, night: CloudRain }, // Slight rain
  63: { day: CloudRain, night: CloudRain }, // Moderate rain
  65: { day: CloudRain, night: CloudRain }, // Heavy rain
  66: { day: CloudRain, night: CloudRain }, // Light freezing rain
  67: { day: CloudRain, night: CloudRain }, // Heavy freezing rain
  71: { day: CloudSnow, night: CloudSnow }, // Slight snow fall
  73: { day: CloudSnow, night: CloudSnow }, // Moderate snow fall
  75: { day: CloudSnow, night: CloudSnow }, // Heavy snow fall
  77: { day: CloudSnow, night: CloudSnow }, // Snow grains
  80: { day: CloudRain, night: CloudRain }, // Slight rain showers
  81: { day: CloudRain, night: CloudRain }, // Moderate rain showers
  82: { day: CloudRain, night: CloudRain }, // Violent rain showers
  85: { day: CloudSnow, night: CloudSnow }, // Slight snow showers
  86: { day: CloudSnow, night: CloudSnow }, // Heavy snow showers
  95: { day: CloudLightning, night: CloudLightning }, // Thunderstorm
  96: { day: CloudLightning, night: CloudLightning }, // Thunderstorm with slight hail
  99: { day: CloudLightning, night: CloudLightning }, // Thunderstorm with heavy hail
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

