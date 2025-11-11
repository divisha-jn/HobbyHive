"use client";

import React, { useState, useRef, useEffect } from "react";

interface LocationAutocompleteInputProps {
  location: string;
  setLocation: (location: string) => void;
  onCoordinatesSelect?: (lat: number, lng: number, locationName: string) => void; 
  disabled?: boolean;
  className?: string;
}


export default function LocationAutocompleteInput({
  location,
  setLocation,
  onCoordinatesSelect, // NEW
  disabled = false,
  className = "",
}: LocationAutocompleteInputProps) {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const handleInputChange = (value: string) => {
    setLocation(value);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (value.trim().length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  };

  const fetchSuggestions = async (query: string) => {
    setIsSearching(true);
    try {
      const response = await fetch(
        `/api/geocode?query=${encodeURIComponent(query)}`
      );
      const data = await response.json();

      if (data.success && data.results) {
        setSuggestions(data.results);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error("Geocoding error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSuggestionClick = (suggestion: any) => {
  setLocation(suggestion.name);
  
  if (onCoordinatesSelect) {
    onCoordinatesSelect(suggestion.latitude, suggestion.longitude, suggestion.name);
  }
  
  setSuggestions([]);
  setShowSuggestions(false);
};


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={location}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => {
          if (suggestions.length > 0) {
            setShowSuggestions(true);
          }
        }}
        className={className}
        placeholder="e.g., Ang Mo Kio Community Club, Raffles Place, or postal code"
        disabled={disabled}
      />

      {isSearching && (
        <div className="absolute right-3 top-3">
          <div className="animate-spin h-5 w-5 border-2 border-teal-500 border-t-transparent rounded-full"></div>
        </div>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full text-left px-4 py-3 hover:bg-teal-50 border-b border-gray-100 last:border-b-0 transition"
            >
              <p className="font-semibold text-gray-800">{suggestion.name}</p>
              <p className="text-xs text-gray-600">{suggestion.address}</p>
              {suggestion.postalCode && (
                <p className="text-xs text-teal-600">
                  📮 {suggestion.postalCode}
                </p>
              )}
            </button>
          ))}
        </div>
      )}

      {showSuggestions &&
        suggestions.length === 0 &&
        !isSearching &&
        location.trim().length >= 3 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center text-gray-500 text-sm">
            No locations found for "{location}"
          </div>
        )}
    </div>
  );
}
