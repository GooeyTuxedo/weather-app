export interface WeatherData {
  daily: {
    time: number[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
    precipitation_probability_max: number[]
    weathercode: number[]
    sunrise: number[]
    sunset: number[]
  }
  hourly: {
    time: number[]
    temperature_2m: number[]
    precipitation_probability: number[]
    weathercode: number[]
    apparent_temperature: number[]
    windspeed_10m: number[]
    cloudcover: number[]
    uv_index: number[]
    relative_humidity_2m: number[]
    pressure_msl: number[]
  }
  timezone: string
}

export interface HourlyData {
  time: Date
  temperature: number
  precipitation: number
  weathercode: number
  apparent_temperature: number
  windspeed_10m: number
  cloudcover: number
  uv_index: number
  relative_humidity_2m: number
  pressure_msl: number
}
