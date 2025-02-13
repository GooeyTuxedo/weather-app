export function createDateInTimezone(unixTime: number, timezone: string): Date {
  const date = new Date(unixTime * 1000)
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })

  const { year, month, day, hour, minute, second } = Object.fromEntries(
    formatter.formatToParts(date).map((part) => [part.type, part.value]),
  ) as Record<string, string>

  return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`)
}

export function formatTime(timestamp: number, timezone: string) {
  return new Date(timestamp * 1000).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: timezone,
  })
}
