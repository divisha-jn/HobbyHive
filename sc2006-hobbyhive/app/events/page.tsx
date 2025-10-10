
"use client";
import React, { useState } from "react";
import Header from "../components/header";
import Navbar from "../components/Navbar";
import Filterbutton from "../components/filterbutton"; 

interface HobbyCardProps {
  image: string;
  title: string;
  onClick: () => void; 
}

const HobbyCard: React.FC<HobbyCardProps> = ({ image, title, onClick }) => (
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

interface Hobby {
  id: number;
  title: string;
  image: string;
}

const EventsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const hobbies: Hobby[] = [
    {
      id: 1,
      title: "Badminton@AMK..",
      image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&h=600&fit=crop",
    },
    {
      id: 2,
      title: "Basketball@OCBC Arena",
      image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&h=600&fit=crop",
    },
    {
      id: 3,
      title: "Arts&Craft@Punggol Community Club",
      image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&h=600&fit=crop",
    },
    {
      id: 4,
      title: "Table Tennis@Yishun Safra",
      image: "https://images.unsplash.com/photo-1609710228159-0fa9bd7c0827?w=800&h=600&fit=crop",
    },
    {
      id: 5,
      title: "MTG@..",
      image: "https://images.unsplash.com/photo-1612404730960-5c71577fca11?w=800&h=600&fit=crop",
    },
    {
      id: 6,
      title: "Karaoke@Westgate",
      image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=600&fit=crop",
    },
    {
      id: 7,
      title: "Swimming@Sentosa Beach",
      image: "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&h=600&fit=crop",
    },
    {
      id: 8,
      title: "Tennis@Yio Chu Kang Tennis Centre",
      image: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&h=600&fit=crop",
    },
    {
      id: 9,
      title: "Hiking@Bukit Timah Hill",
      image: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&h=600&fit=crop",
    },
  ];

  const handleCardClick = (hobby: Hobby) => {
    console.log("Clicked hobby:", hobby.title);
    // Add your navigation logic here
    // router.push(`/hobbies/${hobby.id}`);
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
    <div className="min-h-screen" style={{ backgroundColor: "#A8F0EB" }}>
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
      

      {/* Hobby Cards Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {hobbies.map((hobby) => (
            <HobbyCard
              key={hobby.id}
              image={hobby.image}
              title={hobby.title}
              onClick={() => handleCardClick(hobby)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventsPage;
