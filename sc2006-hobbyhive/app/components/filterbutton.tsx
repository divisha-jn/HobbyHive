"use client";
import React, { useState } from "react";

interface FilterButtonProps {
  onApplyFilters?: (filters: FilterState) => void;
}

interface FilterState {
  categories: string[];
  location: number;
  date: string;
  tags: string;
}

const Filterbutton: React.FC<FilterButtonProps> = ({ onApplyFilters }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [locationRange, setLocationRange] = useState(50);
  const [selectedDate, setSelectedDate] = useState("");
  const [tags, setTags] = useState("");

  const categories = [
    "Walks",
    "Painting",
    "Basketball",
    "Tennis",
    "Soccer",
    "Running",
    "Swimming",
    "Dance",
    "Karaoke",
  ];

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const handleApply = () => {
    const filters: FilterState = {
      categories: selectedCategories,
      location: locationRange,
      date: selectedDate,
      tags: tags,
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
    setLocationRange(50);
    setSelectedDate("");
    setTags("");
  };

  return (
    <>
      {/* Filter Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 hover:bg-gray-100 rounded-lg transition"
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
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">Category</h3>
                  <button className="text-gray-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
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
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">Location</h3>
                  <button className="text-gray-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">0 m</span>
                  <span className="text-sm font-semibold" style={{ color: "#1DDACA" }}>
                    {locationRange} km
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={locationRange}
                  onChange={(e) => setLocationRange(Number(e.target.value))}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #1DDACA 0%, #1DDACA ${(locationRange / 50) * 100}%, #E0F9F7 ${(locationRange / 50) * 100}%, #E0F9F7 100%)`,
                  }}
                />
              </div>

              {/* Date Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">Date</h3>
                  <button className="text-gray-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  
                  style={{ outlineColor: "#1DDACA" }}
                />
              </div>

              {/* Tags Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">Tags</h3>
                  <button className="text-gray-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Type Here..."
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2"
                  style={{ outlineColor: "#1DDACA" }}
                />
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