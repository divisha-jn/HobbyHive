"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
}

export default function EditCancelPage() {
  const supabase = createClient();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHostedEvents();
  }, []);

  const fetchHostedEvents = async () => {
    setLoading(true);
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      console.error(error);
      setLoading(false);
      return;
    }

    try {
      const { data: hostedData, error: hostedError } = await supabase
        .from("events")
        .select("*")
        .eq("host_id", user.id)
        .order("date", { ascending: true });

      if (hostedError) throw hostedError;

      setEvents(hostedData || []);
    } catch (err) {
      console.error("Failed to fetch events", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this event?")) return;

    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) {
      alert("Failed to cancel event: " + error.message);
    } else {
      setEvents(events.filter(e => e.id !== id));
      alert("Event cancelled successfully!");
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/host/CreateEvent?id=${id}`);
  };

  if (loading) return <p className="text-center mt-6">Loading events...</p>;

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center p-6">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-4 text-center">
          <span style={{ color: "#1DDACA" }}>Edit</span> / Cancel Events
        </h1>

        {events.length === 0 ? (
          <p className="text-center text-gray-500">No events found.</p>
        ) : (
          <ul className="space-y-4">
            {events.map((event) => (
              <li
                key={event.id}
                className="border p-4 rounded-md shadow-sm flex justify-between items-center"
              >
                <div>
                  <h3 className="font-semibold text-lg">{event.title}</h3>
                  <p className="text-sm text-gray-600">
                    {event.date} — {event.location}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(event.id)}
                    className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleCancel(event.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    Cancel
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

