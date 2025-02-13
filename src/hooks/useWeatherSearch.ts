"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { debounce } from "lodash"
import type { SearchResult } from "@/types/weather"

export function useWeatherSearch() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const debouncedSearch = useCallback((query: string) => {
    const search = async () => {
      if (query.length < 2) {
        setSearchResults([])
        return
      }
      setIsSearching(true)
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`,
        )
        const data = await response.json()
        setSearchResults(
          data.map((item: { display_name: string, lat: string, lon: string }) => ({
            name: item.display_name.split(",")[0],
            country: item.display_name.split(",").slice(-1)[0].trim(),
            lat: Number.parseFloat(item.lat),
            lon: Number.parseFloat(item.lon),
          })),
        )
      } catch (error) {
        console.error("Error searching for location:", error)
      } finally {
        setIsSearching(false)
      }
    }
    debounce(search, 300)()
  }, [])

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    debouncedSearch(e.target.value)
  }

  return { searchQuery, setSearchQuery, searchResults, isSearching, handleSearchInputChange }
}
