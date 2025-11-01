"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Dynamic import for map picker (only loads on client)
const LocationMapPicker = dynamic(
  () => import("@/app/components/LocationMapPicker"),
  { ssr: false, loading: () => <div className="p-4 text-center text-gray-500">Loading map...</div> }
);

interface FilterButtonProps {
  onApplyFilters?: (filters: FilterState) => void;
}

interface FilterState {
  categories: string[];
  useCurrentLocation: boolean;
  location: string;
  latitude?: number;
  longitude?: number;
  locationRange: number;
  dateFrom: string;
  dateTo: string;
}

const Filterbutton: React.FC<FilterButtonProps> = ({ onApplyFilters }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [useCurrentLocation, setUseCurrentLocation] = useState(true);
  const [customLocation, setCustomLocation] = useState("");
  const [customLocationCoords, setCustomLocationCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locationRange, setLocationRange] = useState(5);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedDateEnd, setSelectedDateEnd] = useState("");
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const categories = [
    "Sports & Fitness",
    "Arts & Crafts",
    "Music",
    "Gaming",
    "Cooking & Baking",
    "Outdoor Activities",
    "Photography",
    "Dance",
    "Reading & Books",
    "Language Learning",
    "Other",
  ];

  // Get user's current location
  useEffect(() => {
    if (useCurrentLocation && !userCoords) {
      setLoadingLocation(true);
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setUserCoords({ lat: latitude, lng: longitude });
            setLoadingLocation(false);
          },
          (error) => {
            console.error("Error getting location:", error);
            setLoadingLocation(false);
          }
        );
      }
    }
  }, [useCurrentLocation, userCoords]);

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const handleLocationSelect = (locationName: string, lat?: number, lng?: number) => {
    setCustomLocation(locationName);
    if (lat && lng) {
      setCustomLocationCoords({ lat, lng });
    }
    setShowMapPicker(false);
  };

  const handleApply = () => {
    const filters: FilterState = {
      categories: selectedCategories,
      useCurrentLocation: useCurrentLocation,
      location: useCurrentLocation ? "" : customLocation,
      latitude: useCurrentLocation ? userCoords?.lat : customLocationCoords?.lat,
      longitude: useCurrentLocation ? userCoords?.lng : customLocationCoords?.lng,
      locationRange: locationRange,
      dateFrom: selectedDate,
      dateTo: selectedDateEnd,
    };

    if (onApplyFilters) {
      onApplyFilters(filters);
    }

    console.log("Applied filters:", filters);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  const handleClear = () => {
    setSelectedCategories([]);
    setUseCurrentLocation(true);
    setCustomLocation("");
    setCustomLocationCoords(null);
    setLocationRange(5);
    setSelectedDate("");
    setSelectedDateEnd("");
  };

  return (
    <>
      {/* Filter Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 hover:bg-gray-100 rounded-lg transition"
        title="Open filters"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-gray-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
      </button>

      {/* Filter Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 pointer-events-none"
            onClick={handleCancel}
          />

          {/* Filter Panel */}
          <div className="relative bg-white w-full max-w-md h-full overflow-y-auto shadow-2xl">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Search with filters</h2>
                <button
                  onClick={handleCancel}
                  className="p-2 hover:bg-gray-100 rounded-full transition"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Category Section */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Category</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => toggleCategory(category)}
                      className="px-4 py-2 rounded-full text-sm font-medium transition"
                      style={{
                        backgroundColor: selectedCategories.includes(category)
                          ? "#1DDACA"
                          : "#E0F9F7",
                        color: selectedCategories.includes(category)
                          ? "white"
                          : "#363636",
                      }}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location Section */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Location</h3>

                {/* Location Toggle */}
                <div className="flex gap-4 mb-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="location-type"
                      checked={useCurrentLocation}
                      onChange={() => {
                        setUseCurrentLocation(true);
                        setShowMapPicker(false);
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Current Location</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="location-type"
                      checked={!useCurrentLocation}
                      onChange={() => {
                        setUseCurrentLocation(false);
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Choose Location</span>
                  </label>
                </div>

                {/* Show current location status */}
                {useCurrentLocation && (
                  <div className="mb-4 p-3 bg-teal-50 rounded-lg">
                    {loadingLocation ? (
                      <p className="text-sm text-teal-700">📍 Getting your location...</p>
                    ) : userCoords ? (
                      <p className="text-sm text-teal-700">✓ Using your current location</p>
                    ) : (
                      <p className="text-sm text-teal-700">⚠️ Enable location to use current location</p>
                    )}
                  </div>
                )}

                {/* Custom location picker */}
                {!useCurrentLocation && (
                  <div className="mb-4">
                    <button
                      onClick={() => setShowMapPicker(!showMapPicker)}
                      className="w-full px-4 py-2 text-white rounded-lg transition"
                      style={{ backgroundColor: "#1DDACA" }}
                    >
                      {customLocation ? `📍 ${customLocation}` : "Pick a Location"}
                    </button>

                    {/* Map Picker Modal */}
                    {showMapPicker && (
                      <div className="mt-4 p-4 border border-gray-300 rounded-lg bg-gray-50 max-h-96 overflow-y-auto">
                        <LocationMapPicker
                          onLocationSelect={handleLocationSelect}
                          selectedLocation={customLocation}
                          eventCategory="Other"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Distance Slider */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Range:</span>
                  <span className="text-sm font-semibold" style={{ color: "#1DDACA" }}>
                    {locationRange} km
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="50"
                  step="0.5"
                  value={locationRange}
                  onChange={(e) => setLocationRange(Number(e.target.value))}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #1DDACA 0%, #1DDACA ${(locationRange / 50) * 100}%, #E0F9F7 ${(locationRange / 50) * 100}%, #E0F9F7 100%)`,
                  }}
                />
              </div>

              {/* Date Range Section */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Date Range</h3>

                <div className="mb-4">
                  <label className="text-sm text-gray-600 mb-2 block">From</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    style={{ outlineColor: "#1DDACA" }}
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600 mb-2 block">To</label>
                  <input
                    type="date"
                    value={selectedDateEnd}
                    onChange={(e) => setSelectedDateEnd(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    style={{ outlineColor: "#1DDACA" }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-8">
                <button
                  onClick={handleClear}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
                >
                  Clear
                </button>
                <button
                  onClick={handleApply}
                  className="flex-1 px-6 py-3 text-white rounded-lg font-medium hover:opacity-90 transition"
                  style={{ backgroundColor: "#1DDACA" }}
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Filterbutton;
