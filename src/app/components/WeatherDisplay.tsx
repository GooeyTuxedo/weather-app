import type React from "react"

interface WeatherData {
  daily: {
    time: string[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
    precipitation_sum: number[]
  }
}

interface WeatherDisplayProps {
  weatherData: WeatherData
}

const WeatherDisplay: React.FC<WeatherDisplayProps> = ({ weatherData }) => {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Los Angeles Weather</h2>
      <div className="space-y-4">
        {weatherData.daily.time.map((date, index) => (
          <div key={date} className="bg-white rounded-lg shadow-md p-4">
            <p className="font-semibold">
              {new Date(date).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
            </p>
            <p>High: {weatherData.daily.temperature_2m_max[index]}°C</p>
            <p>Low: {weatherData.daily.temperature_2m_min[index]}°C</p>
            <p>Precipitation: {weatherData.daily.precipitation_sum[index]} mm</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default WeatherDisplay
