import { NextResponse } from "next/server"

export async function GET() {
  const lat = 34.0522 // Los Angeles latitude
  const lon = -118.2437 // Los Angeles longitude

  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=America%2FLos_Angeles`,
    )
  
    const data = await response.json()
    console.log("API response: \n", data)
  
    return NextResponse.json(data)

  } catch (error) {
    console.log("Error fetching forecast! --> ", error)
    return NextResponse.error()
  }
}
