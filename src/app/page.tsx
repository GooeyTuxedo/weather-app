import WeatherDisplay from "./components/WeatherDisplay"

async function getWeatherData() {
  const res = await fetch("http://localhost:3000/api/weather", { cache: "no-store" })
  if (!res.ok) {
    throw new Error("Failed to fetch weather data")
  }
  return res.json()
}

export default async function Home() {
  const weatherData = await getWeatherData()

  return (
    <main className="min-h-screen bg-gray-100">
      <WeatherDisplay weatherData={weatherData} />
    </main>
  )
}
