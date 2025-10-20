"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "./components/Navbar";
import Header from "./components/header";
import { createClient } from "@/utils/supabase/client";

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role === "admin") {
        setIsAdmin(true);
      }
      
      setLoading(false);
    };

    checkAdminStatus();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const { data, error } = await supabase
      .from("events")
      .select("id, title, location, date, category")
      .ilike("title", `%${query}%`);

    if (error) {
      console.error("Search error:", error);
      return;
    }

    setResults(data || []);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-teal-100 to-white">
  
      {/* Navbar */}
      <div className="absolute top-2 left-4 z-50">
        <Navbar />
      </div>

      {/* Header */}
      <Header />

      {/* Hero section */}
      <section className="text-center py-20 bg-gradient-to-r from-teal-400 to-cyan-500 text-white shadow-md">
        <h1 className="text-5xl font-extrabold mb-4">
          Discover & Join Events Around You
        </h1>
        <p className="text-lg mb-6 max-w-2xl mx-auto">
          Whether you're looking to attend, organize, or moderate — find what
          inspires you.
        </p>

        {/* Search bar */}
        <form
          onSubmit={handleSearch}
          className="flex justify-center gap-2 max-w-xl mx-auto"
        >
          <input
            type="text"
            placeholder="Search for events..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 p-3 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-300"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-white text-teal-600 font-semibold rounded-lg shadow hover:bg-gray-100"
          >
            Search
          </button>
        </form>
      </section>

      {/* Search results */}
      {results.length > 0 && (
        <section className="max-w-4xl mx-auto mt-10 px-4">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Search Results
          </h2>
          <div className="space-y-4">
            {results.map((event) => (
              <div
                key={event.id}
                className="p-4 bg-white rounded-lg shadow hover:shadow-md transition"
              >
                <h3 className="text-xl font-semibold text-teal-700">
                  {event.title}
                </h3>
                <p className="text-gray-600">
                  📍 {event.location} —{" "}
                  {new Date(event.date).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-500">Category: {event.category}</p>
                <Link
                  href={`/events/${event.id}`}
                  className="text-teal-600 font-medium hover:underline"
                >
                  View Details →
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* About Us section */}
      <section className="bg-white mt-20 py-16 text-center border-t">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">About Us</h2>
          <p className="text-gray-600 text-lg mb-6">
            We believe in connecting people through shared experiences.  
            Our platform empowers communities to discover, host, and manage events — 
            from local gatherings to large-scale activities — all in one place.
          </p>
          <p className="text-gray-600">
            Whether you're an attendee, organizer, or moderator, we make event management
            simple, social, and meaningful.
          </p>
        </div>
      </section>

      {/* Quick Links footer */}
      <footer className="py-8 bg-gray-100 text-center text-gray-600">
        <div className="space-x-4">
          <Link href="/profile" className="hover:text-teal-600">
            My Profile
          </Link>
          <Link href="/events" className="hover:text-teal-600">
            Browse Events
          </Link>
          {/* Only show Admin Panel link if user is admin */}
          {!loading && isAdmin && (
            <Link href="/admin" className="hover:text-teal-600">
              Admin Panel
            </Link>
          )}
        </div>
        <p className="text-sm mt-4">© {new Date().getFullYear()} HobbyHive</p>
      </footer>
    </main>
  );
}
