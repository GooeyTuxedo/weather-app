"use client"

import { ArrowLeft } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface SettingsProps {
  onClose: () => void
  units: "metric" | "imperial"
  onUnitsChange: (units: "metric" | "imperial") => void
  onLocationUpdate: () => void
}

export default function Settings({ onClose, units, onUnitsChange, onLocationUpdate }: SettingsProps) {
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false)

  const handleLocationUpdate = async () => {
    setIsUpdatingLocation(true)
    try {
      await onLocationUpdate()
    } finally {
      setIsUpdatingLocation(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-900 text-white p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center mb-8">
          <button onClick={onClose} className="p-2">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="text-xl ml-2">Settings</h2>
        </div>

        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Use Imperial Units</p>
              <p className="text-sm text-gray-400">Show temperature in Fahrenheit</p>
            </div>
            <Switch
              checked={units === "imperial"}
              onCheckedChange={(checked) => onUnitsChange(checked ? "imperial" : "metric")}
            />
          </div>

          <div>
            <p className="font-medium mb-2">Location</p>
            <Button variant="outline" className="w-full dark" onClick={handleLocationUpdate} disabled={isUpdatingLocation}>
              {isUpdatingLocation ? "Updating..." : "Use Current Location"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

