"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

const mockEvents = [
  { id: 1, title: "Badminton Meetup", date: "2025-10-12", location: "NTU Hall 2" },
  { id: 2, title: "Art Jam", date: "2025-11-03", location: "Jurong East CC" },
];

export default function EditCancelPage() {
  const [events, setEvents] = useState(mockEvents);

  const handleCancel = (id: number) => {
    const updated = events.filter((e) => e.id !== id);
    setEvents(updated);
    alert("Event cancelled!");
  };

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
              <li key={event.id} className="border p-4 rounded-md shadow-sm flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-lg">{event.title}</h3>
                  <p className="text-sm text-gray-600">
                    {event.date} — {event.location}
                  </p>
                </div>
                <button
                  onClick={() => handleCancel(event.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Cancel
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
