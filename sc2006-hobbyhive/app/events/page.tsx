"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Header from "../components/header";
import Navbar from "../components/Navbar";
import Filterbutton from "../components/filterbutton";

interface Event {
  id: string;
  title: string;
  image_url: string;
  category: string;
  date: string;
  skill_level?: string;
  latitude?: number;
  longitude?: number;
}

interface EventCardProps {
  image: string;
  title: string;
  date: string;
  skillLevel?: string;
  onClick: () => void;
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

const EventCard: React.FC<EventCardProps> = ({ image, title, date, skillLevel, onClick }) => {
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
    >
      {/* Image Container */}
      <div className="relative h-40 bg-gray-200 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Content Container */}
      <div className="p-3">
        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2 hover:text-cyan-600 transition">
          {title}
        </h3>

        {/* Date and Skill Level */}
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-cyan-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>{formatDate(date)}</span>
          </div>

          {skillLevel && (
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-cyan-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <span className="capitalize">{skillLevel}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Haversine formula to calculate distance between two coordinates
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const EventsPage: React.FC = () => {
  const router = useRouter();
  const supabase = createClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [events, setEvents] = useState<Event[]>([]);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Load filters from localStorage on component mount
  useEffect(() => {
    setIsClient(true);
    const savedFilters = localStorage.getItem("eventFilters");
    if (savedFilters) {
      try {
        const parsedFilters = JSON.parse(savedFilters);
        setFilters(parsedFilters);
      } catch (error) {
        console.error("Error parsing saved filters:", error);
      }
    }
  }, []);

  // Fetch events from Supabase
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data, error } = await supabase
          .from("events")
          .select("id, title, image_url, category, skill_level, date, latitude, longitude")
          .eq("status", "approved")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching events:", error);
        } else {
          setAllEvents(data || []);
          
          // Apply saved filters if they exist
          if (filters) {
            applyFiltersToEvents(filters, data || []);
          } else {
            setEvents(data || []);
          }
        }
      } catch (err) {
        console.error("Unexpected error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (isClient) {
      fetchEvents();
    }
  }, [supabase, isClient, filters]);

  const handleCardClick = (event: Event) => {
    console.log("Clicked Event:", event.title);
    router.push(`/events/${event.id}`);
  };

  const handleSearch = (query: string) => {
    let filtered = allEvents.filter((event) =>
      event.title.toLowerCase().includes(query.toLowerCase())
    );
    
    // If filters are active, apply them too
    if (filters) {
      applyFiltersToEvents(filters, filtered);
    } else {
      setEvents(filtered);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim() === "") {
      if (filters) {
        applyFiltersToEvents(filters, allEvents);
      } else {
        setEvents(allEvents);
      }
    } else {
      handleSearch(query);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch(searchQuery);
    }
  };

  // Apply filters logic (extracted for reuse)
  const applyFiltersToEvents = (appliedFilters: FilterState, eventsToFilter: Event[]) => {
    let filtered = [...eventsToFilter];

    // 1. Filter by categories
    if (appliedFilters.categories.length > 0) {
      filtered = filtered.filter((event) =>
        appliedFilters.categories.includes(event.category)
      );
    }

    // 2. Filter by date range
    if (appliedFilters.dateFrom || appliedFilters.dateTo) {
      filtered = filtered.filter((event) => {
        const eventDate = new Date(event.date);

        // If only "From" date is set
        if (appliedFilters.dateFrom && !appliedFilters.dateTo) {
          return eventDate >= new Date(appliedFilters.dateFrom);
        }

        // If only "To" date is set
        if (appliedFilters.dateTo && !appliedFilters.dateFrom) {
          return eventDate <= new Date(appliedFilters.dateTo);
        }

        // If both dates are set
        if (appliedFilters.dateFrom && appliedFilters.dateTo) {
          const fromDate = new Date(appliedFilters.dateFrom);
          const toDate = new Date(appliedFilters.dateTo);
          return eventDate >= fromDate && eventDate <= toDate;
        }

        return true;
      });
    }

    // 3. Filter by location and distance
    if (
      appliedFilters.latitude !== undefined &&
      appliedFilters.longitude !== undefined
    ) {
      filtered = filtered.filter((event) => {
        // Skip events without coordinates
        if (!event.latitude || !event.longitude) {
          return false;
        }

        const distance = calculateDistance(
          appliedFilters.latitude!,
          appliedFilters.longitude!,
          event.latitude,
          event.longitude
        );

        return distance <= appliedFilters.locationRange;
      });
    }

    setEvents(filtered);
  };

  // Apply filters
  const handleApplyFilters = (appliedFilters: FilterState) => {
    setFilters(appliedFilters);
    console.log("Applied filters:", appliedFilters);

    // Save filters to localStorage
    localStorage.setItem("eventFilters", JSON.stringify(appliedFilters));

    applyFiltersToEvents(appliedFilters, allEvents);
  };

  // Clear filters
  const handleClearFilters = () => {
    setFilters(null);
    setEvents(allEvents);
    setSearchQuery("");
    // Remove from localStorage
    localStorage.removeItem("eventFilters");
  };

  if (!isClient) {
    return null; // Avoid hydration mismatch
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-teal-400 to-cyan-500">
      {/* Navbar */}
      <div className="absolute top-2 left-4 z-50">
        <Navbar />
      </div>

      {/* Header */}
      <Header />

      {/* Search Bar */}
      <div className="bg-white shadow-sm py-4 px-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <Filterbutton onApplyFilters={handleApplyFilters} />
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
            />
            <button
              onClick={() => handleSearch(searchQuery)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              {/* Search Icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </div>

          {/* Clear Filters Button (shows when filters are active) */}
          {filters && (
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 bg-red-500 text-white rounded-full text-sm font-medium hover:bg-red-600 transition"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {filters && (
        <div className="bg-teal-50 py-2 px-4 border-b border-teal-200">
          <div className="max-w-7xl mx-auto text-sm text-teal-800">
            <span className="font-semibold">Active Filters:</span>
            {filters.categories.length > 0 && (
              <span className="ml-2">
                Categories: {filters.categories.join(", ")}
              </span>
            )}
            {(filters.dateFrom || filters.dateTo) && (
              <span className="ml-2">
                Date: {filters.dateFrom ? new Date(filters.dateFrom).toLocaleDateString() : "Any"}
                {" to "}
                {filters.dateTo ? new Date(filters.dateTo).toLocaleDateString() : "Any"}
              </span>
            )}
            {filters.latitude && filters.longitude && (
              <span className="ml-2">Range: {filters.locationRange} km</span>
            )}
          </div>
        </div>
      )}

      {/* Event Cards Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <p className="text-center text-white text-lg">Loading events...</p>
        ) : events.length === 0 ? (
          <p className="text-center text-white text-lg">
            {filters ? "No events match your filters" : "No events found"}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {events.map((event) => (
              <EventCard
                key={event.id}
                image={event.image_url}
                title={event.title}
                date={event.date}
                skillLevel={event.skill_level} // Type assertion for skill_level
                onClick={() => handleCardClick(event)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPage;
