"use client";
import React, { useState, useEffect } from "react";
import Header from "../components/header";
import Navbar from "../components/Navbar";
import Link from "next/link";

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  image: string;
  attendees: string;
  attendeeNames?: string[]; // new field for attendee names
}

export default function MyEvents() {
  const [activeTab, setActiveTab] = useState<"attending" | "hosting">("attending");
  const [showAttendeeModal, setShowAttendeeModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [hostedEvents, setHostedEvents] = useState<Event[]>([]);

  const attendingEvents = [
    {
      title: "Badminton @ Bukit Panjang CC",
      date: "26 August 2026",
      time: "20:00",
      host: "Alan Wong",
      image:
        "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&h=600&fit=crop",
    },
  ];

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("hostedEvents") || "[]");
    setHostedEvents(stored);
  }, []);

  // Sample attendees for demo — ideally this would come from Supabase later
  const defaultAttendees = ["You"];

  return (
    <div className="min-h-screen bg-gradient-to-r from-teal-400 to-cyan-500 relative">
      <div className="absolute top-2 left-4 z-50">
        <Navbar />
      </div>
      <Header />

      <div className="flex justify-center mt-6">
        <div className="bg-gray-100 rounded-md shadow-md flex w-[600px] justify-around">
          <button
            onClick={() => setActiveTab("attending")}
            className={`flex-1 py-3 font-semibold hover:shadow-md transition-shadow ${
              activeTab === "attending"
                ? "border-b-4 border-black text-black"
                : "text-gray-600"
            }`}
          >
            Events Attending
          </button>
          <button
            onClick={() => setActiveTab("hosting")}
            className={`flex-1 py-3 font-semibold hover:shadow-md transition-shadow ${
              activeTab === "hosting"
                ? "border-b-4 border-black text-black"
                : "text-gray-600"
            }`}
          >
            Events Hosting
          </button>
        </div>
      </div>

      <div className="flex justify-center mt-6 flex-col items-center">
        {activeTab === "attending" ? (
          attendingEvents.map((event, index) => (
            <div
              key={index}
              className="bg-white shadow-md rounded-md p-4 w-[700px] flex items-center mb-4"
            >
              <img
                src={event.image}
                alt="Event"
                className="w-28 h-20 rounded-lg object-cover mr-4"
              />
              <div className="flex-1">
                <h2 className="font-semibold text-lg">{event.title}</h2>
                <p>Date: {event.date}</p>
                <p>Time: {event.time}</p>
                <p>
                  Hosted By: {event.host} |{" "}
                  <Link href="/groupchat">
                    <button className="border border-teal-400 text-teal-500 px-4 py-1 rounded hover:bg-teal-100 transition">
                      Group Chat
                    </button>
                  </Link>
                </p>
              </div>
            </div>
          ))
        ) : hostedEvents.length > 0 ? (
          hostedEvents.map((event) => (
            <div
              key={event.id}
              className="bg-white shadow-md rounded-md p-4 w-[700px] flex items-center mb-4"
            >
              <img
                src={event.image}
                alt={event.title}
                className="w-28 h-20 rounded-lg object-cover mr-4"
              />
              <div className="flex-1">
                <h2 className="font-semibold text-lg">{event.title}</h2>
                <p>Date: {event.date}</p>
                <p>Time: {event.time}</p>
                <p>
                  Attendees: <b>{event.attendees}</b> |{" "}
                  <button
                    onClick={() => {
                      setSelectedEvent(event);
                      setShowAttendeeModal(true);
                    }}
                    className="text-teal-500 underline hover:text-teal-600 transition"
                  >
                    Attendee List
                  </button>
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <button className="bg-teal-400 text-white px-4 py-1 rounded hover:bg-teal-500">
                  Edit Details
                </button>
                <Link href="/groupchat">
                  <button className="border border-teal-400 text-teal-500 px-4 py-1 rounded hover:bg-teal-100">
                    Group Chat
                  </button>
                </Link>
                <button
                  className="border border-red-400 text-red-500 px-4 py-1 rounded hover:bg-red-100"
                  onClick={() => {
                    const updated = hostedEvents.filter((e) => e.id !== event.id);
                    setHostedEvents(updated);
                    localStorage.setItem("hostedEvents", JSON.stringify(updated));
                  }}
                >
                  Cancel Event
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-white font-medium mt-6">No hosted events yet.</p>
        )}

        <div className="mt-4">
          {activeTab === "attending" ? (
            <Link href="/events" className="text-black font-semibold underline">
              Find More Events Here!
            </Link>
          ) : (
            <Link
              href="/host/CreateEvent"
              className="text-black font-semibold underline"
            >
              Host More Events!
            </Link>
          )}
        </div>
      </div>

      {/* ✅ Modal for Attendee List */}
      {showAttendeeModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-[400px]">
            <h2 className="text-xl font-semibold mb-4">
              Attendees for {selectedEvent.title}
            </h2>

            <ul className="list-disc pl-6 text-gray-700">
              {(selectedEvent.attendeeNames || defaultAttendees).map(
                (name, i) => (
                  <li key={i}>{name}</li>
                )
              )}
            </ul>

            <button
              onClick={() => setShowAttendeeModal(false)}
              className="mt-6 bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
