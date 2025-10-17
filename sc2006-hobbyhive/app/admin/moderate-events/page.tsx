"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import Header from "@/app/components/header";
import Navbar from "@/app/components/Navbar";
import AuthWrapper from "@/app/components/AuthWrapper";
import { useRouter } from "next/navigation";


interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  location: string;
  is_flagged: boolean;
  flag_reason: string | null;
  status: string;
  created_at: string;
}

const ModerateEvents: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    fetchFlaggedEvents();
  }, []);

  const fetchFlaggedEvents = async () => {
    setLoading(true);
    console.log("[fetchFlaggedEvents] Loading flagged events...");
    try {
      const { data, error } = await supabase
        .from("event_flags")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      console.log("[fetchFlaggedEvents] Loaded", data?.length, "flagged events");
      setEvents(data || []);
    } catch (error) {
      console.error("[fetchFlaggedEvents] Error:", error);
      alert("Failed to load flagged events");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFlag = async (eventId: string, title: string) => {
    const confirmRemove = confirm(`Remove flag from event "${title}"?`);
    if (!confirmRemove) return;

    console.log("[handleRemoveFlag] Removing flag from event:", eventId);
    try {
      const { error } = await supabase
        .from("events")
        .update({
          is_flagged: false,
          flag_reason: null,
        })
        .eq("id", eventId);

      if (error) throw error;

      alert("✅ Flag removed successfully");
      fetchFlaggedEvents();
    } catch (error) {
      console.error("[handleRemoveFlag] Error:", error);
      alert("❌ Failed to remove flag");
    }
  };

  const handleDeleteEvent = async (eventId: string, title: string) => {
    const reason = prompt(`Delete event "${title}"?\nPlease provide a reason:`);
    if (reason === null) return;

    const confirmDelete = confirm(
      "Are you sure you want to permanently delete this event?"
    );
    if (!confirmDelete) return;

    console.log("[handleDeleteEvent] Deleting event:", eventId);
    try {
      const { error } = await supabase.from("events").delete().eq("id", eventId);

      if (error) throw error;

      alert("✅ Event deleted successfully");
      fetchFlaggedEvents();
    } catch (error) {
      console.error("[handleDeleteEvent] Error:", error);
      alert("❌ Failed to delete event");
    }
  };

  return (
    <AuthWrapper allowedRoles={["admin"]}>
        <div className="min-h-screen" style={{ backgroundColor: "#A8F0EB" }}>
          <div className="absolute top-2 left-4 z-50">
            <Navbar />
          </div>
          <Header />

          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-800">Moderate Flagged Events</h1>
              <button
                onClick={() => router.push("/admin")}
                className="px-4 py-2 text-white rounded-lg shadow-md hover:opacity-80"
                style={{ backgroundColor: "#1DDACA" }}
              >
                ← Back to Dashboard
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8 text-gray-700">Loading...</div>
            ) : events.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
                No flagged events to moderate
              </div>
            ) : (
              <div className="space-y-4">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-semibold text-gray-800">
                            {event.title}
                          </h3>
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">
                            FLAGGED
                          </span>
                        </div>
                        <p className="text-gray-600 mb-3">{event.description}</p>
                        {event.flag_reason && (
                          <div className="bg-red-50 border border-red-200 rounded p-3 mb-3">
                            <p className="text-sm text-red-800">
                              <strong>Flag Reason:</strong> {event.flag_reason}
                            </p>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                          <p>
                            <strong>Category:</strong> {event.category}
                          </p>
                          <p>
                            <strong>Date:</strong>{" "}
                            {new Date(event.date).toLocaleDateString()}
                          </p>
                          <p>
                            <strong>Location:</strong> {event.location}
                          </p>
                          <p>
                            <strong>Status:</strong> {event.status}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleRemoveFlag(event.id, event.title)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-md"
                        >
                          Remove Flag
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.id, event.title)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-md"
                        >
                          Delete Event
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </AuthWrapper>
  );
};

export default ModerateEvents;
