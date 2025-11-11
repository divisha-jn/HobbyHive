"use client";
import React from "react";
import dynamic from "next/dynamic";
import { getLocationConfigForCategory } from "@/app/config/categoryLocationMapping";
import LocationAutocompleteInput from "@/app/components/LocationAutocompleteInput";

const LocationMapPicker = dynamic(
  () => import("@/app/components/LocationMapPicker"),
  { ssr: false }
);

interface LocationSectionProps {
  location: string;
  setLocation: (location: string) => void;
  latitude: number | null;
  setLatitude: (lat: number | null) => void;
  longitude: number | null;
  setLongitude: (lng: number | null) => void;
  nearestMRT: string | null;
  nearestMRTDistance: number | null;
  category: string;
  useMapPicker: boolean;
  setUseMapPicker: (useMap: boolean) => void;
  errors: { [key: string]: boolean };
  onLocationSelect: (locationName: string, lat?: number, lng?: number) => void;
  getInputClassName: (fieldName: string) => string;
}

export default function LocationSection({
  location, setLocation,
  latitude, setLatitude,
  longitude, setLongitude,
  nearestMRT, nearestMRTDistance,
  category, useMapPicker, setUseMapPicker,
  errors, onLocationSelect, getInputClassName
}: LocationSectionProps) {
  
  const handleCoordinatesSelect = async (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
    // MRT logic would be handled by controller
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block font-semibold">Location *</label>
        {category &&
          getLocationConfigForCategory(category).showMapPicker && (
            <button
              type="button"
              onClick={() => setUseMapPicker(!useMapPicker)}
              className="text-sm bg-teal-100 text-teal-700 px-3 py-1 rounded hover:bg-teal-200 transition"
            >
              {useMapPicker ? "Switch to Manual Entry" : "Use Map Picker"}
            </button>
          )}
      </div>

      {!category && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded mb-3 text-sm text-yellow-800">
           Please select an event category first
        </div>
      )}

      {useMapPicker && category && getLocationConfigForCategory(category).showMapPicker ? (
        <>
          <LocationMapPicker
            onLocationSelect={onLocationSelect}
            selectedLocation={location}
            eventCategory={category}
          />
          {location && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
              <p className="text-sm text-green-800">
                <strong>Selected:</strong> {location}
              </p>
            </div>
          )}
        </>
      ) : (
        <LocationAutocompleteInput
          location={location}
          setLocation={setLocation}
          onCoordinatesSelect={handleCoordinatesSelect}
          disabled={!category}
          className={getInputClassName("location")}
        />
      )}

      {nearestMRT && nearestMRTDistance && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded mt-3">
          <p className="text-sm text-blue-800">
             <strong>Nearest MRT:</strong> {nearestMRT} ({nearestMRTDistance} km away)
          </p>
        </div>
      )}
    </div>
  );
}
