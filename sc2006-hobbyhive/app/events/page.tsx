
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
}
interface EventCardProps {
  image: string;
  title: string;
  onClick: () => void; 
}

const EventCard: React.FC<EventCardProps> = ({ image, title, onClick }) => (
  <div
    onClick={onClick}
    className="relative rounded-2xl overflow-hidden cursor-pointer transition-transform hover:scale-105 hover:shadow-xl"
    style={{ aspectRatio: "4/3" }}
  >
    <img
      src={image}
      alt={title}
      className="w-full h-full object-cover"
    />
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
      <h3 className="text-white font-semibold text-lg">{title}</h3>
    </div>
  </div>
);


const EventsPage: React.FC = () => {
  const router = useRouter();
  const supabase = createClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

    // Fetch events from Supabase
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data, error } = await supabase
          .from("events")
          .select("id, title, image_url")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching events:", error);
        } else {
          setEvents(data || []);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [supabase]);

  const handleCardClick = (Event: Event) => {
    console.log("Clicked Event:", Event.title);
    router.push(`/events/${Event.id}`);
  };

  const handleSearch = () => {
    console.log("Searching for:", searchQuery);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="bg-gradient-to-r from-teal-400 to-cyan-500">
      {/* Navbar */}
      <div className="absolute top-2 left-4 z-50">
        <Navbar />
      </div>

      {/* Header */}
      <Header />

      {/* Search Bar */}
      <div className="bg-white shadow-sm py-4 px-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <Filterbutton onApplyFilters={(filters) => console.log("Filters applied:", filters)} />
          <div className="flex-1 relative">
            <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
              />
              <button
                onClick={handleSearch}
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
          </div>
        </div>
      

      {/* Event Cards Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {events.length === 0 ? (
          <p className="text-center text-white text-lg">No events found</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((Event) => (
            <EventCard
              key={Event.id}
              image={Event.image_url}
              title={Event.title}
              onClick={() => handleCardClick(Event)}
            />
          ))}
        </div>
        )}
      </div>
    </div>
  );
};

export default EventsPage;
