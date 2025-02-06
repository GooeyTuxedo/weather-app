import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get("lat") ?? "34.0522"
  const lon = searchParams.get("lon") ?? "-118.2437"

  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&hourly=temperature_2m,precipitation_probability,weathercode,apparent_temperature,windspeed_10m,cloudcover,uv_index,relative_humidity_2m,pressure_msl` +
    `&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset` +
    `&current_weather=true` +
    `&timezone=auto&timeformat=unixtime`,  )

  const data = await response.json()

  return NextResponse.json(data)
}