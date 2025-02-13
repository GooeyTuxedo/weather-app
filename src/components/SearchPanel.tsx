import type React from "react"
import { MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { SearchResult } from "@/types/weather"

interface SearchPanelProps {
  searchQuery: string
  isSearching: boolean
  searchResults: SearchResult[]
  onSearchInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onLocationUpdate: () => void
  onSearchSelect: (result: SearchResult) => void
  onClose: () => void
}

export function SearchPanel({
  searchQuery,
  isSearching,
  searchResults,
  onSearchInputChange,
  onLocationUpdate,
  onSearchSelect,
  onClose,
}: SearchPanelProps) {
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
        <div className="flex items-center gap-2 mb-4">
          <Input
            type="text"
            value={searchQuery}
            onChange={onSearchInputChange}
            placeholder="Search city..."
            className="flex-grow"
          />
          <Button onClick={onLocationUpdate}>
            <MapPin className="h-[1.2rem] w-[1.2rem]" />
          </Button>
        </div>
        {isSearching && <div className="text-center">Searching...</div>}
        {!isSearching && searchResults.length > 0 && (
          <ul className="max-h-60 overflow-auto">
            {searchResults.map((result, index) => (
              <li key={index} className="p-2 hover:bg-gray-700 cursor-pointer" onClick={() => onSearchSelect(result)}>
                {result.name}, {result.country}
              </li>
            ))}
          </ul>
        )}
        <Button variant="ghost" onClick={onClose} className="mt-4">
          Cancel
        </Button>
      </div>
    </div>
  )
}
