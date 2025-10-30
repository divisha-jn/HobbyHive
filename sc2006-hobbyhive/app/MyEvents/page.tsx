"use client";
import React, { useState, useEffect } from "react";
import Header from "../components/header";
import Navbar from "../components/Navbar";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { getRecommendedEvents } from "@/utils/supabase/participantService";
import { useRouter } from "next/navigation";

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  image?: string;
  host?: string;
  hostName?: string;
  status?: string;
  attendees?: string;
  attendeeNames?: string[];
  capacity?: string;
  disabled?: boolean; // optional disable flag
}

export default function MyEvents() {
  const [activeTab, setActiveTab] = useState<"attending" | "hosting">("attending");
  const [showAttendeeModal, setShowAttendeeModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [hostedEvents, setHostedEvents] = useState<Event[]>([]);
  const [attendingEvents, setAttendingEvents] = useState<Event[]>([]);
  const [recommendedEvents, setRecommendedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const defaultAttendees = ["You"];
  const router = useRouter();

  useEffect(() => {
    fetchMyEvents();
    fetchRecommended();
  }, []);

  const fetchMyEvents = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error(userError);
        setLoading(false);
        return;
      }
      const userId = user.id;

      const fallbackImage =
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop";

      // Hosted events
      const { data: hostedData, error: hostedError } = await supabase
        .from("events")
        .select("*")
        .eq("host_id", userId)
        .order("date", { ascending: true });

      if (hostedError) throw hostedError;

      let hosted = hostedData?.map((e: any) => ({
        ...e,
        image: e.image_url || fallbackImage,
        disabled: false, // default, implement logic if needed
      })) || [];

      const statusOrder = { approved: 1, pending: 2, cancelled: 3 } as const;
      hosted.sort((a, b) => {
        const aStatus = a.status as keyof typeof statusOrder;
        const bStatus = b.status as keyof typeof statusOrder;
        return (statusOrder[aStatus] ?? 99) - (statusOrder[bStatus] ?? 99);
      });

      setHostedEvents(hosted);

      // Attending events
      const { data: participantData, error: participantError } = await supabase
        .from("event_participants")
        .select(`
          event_id,
          events (
            id,
            title,
            date,
            time,
            location,
            image_url,
            host_id,
            status,
            capacity
          )
        `)
        .eq("user_id", userId)
        .eq("events.status", "approved");

      if (participantError) throw participantError;

      const validParticipants = participantData?.filter((p: any) => p.events !== null) || [];

      const attending = validParticipants.map((p: any) => ({
        id: p.event_id,
        title: p.events.title,
        date: p.events.date,
        time: p.events.time,
        location: p.events.location,
        image: p.events.image_url || fallbackImage,
        host: p.events.host_id,
        status: p.events.status,
        capacity: p.events.capacity,
      }));

      const hostIds = attending.map(e => e.host);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username")
        .in("id", hostIds);

      const attendingWithHostName = attending.map(e => ({
        ...e,
        hostName: profiles?.find(p => p.id === e.host)?.username || "Unknown",
      }));

      setAttendingEvents(attendingWithHostName);

    } catch (err) {
      console.error("Failed to fetch events", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommended = async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) return;

    try {
      const recEvents = await getRecommendedEvents(user.id);
      setRecommendedEvents(recEvents || []);
    } catch (err) {
      console.error("Failed to fetch recommended events", err);
    }
  };

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
        {activeTab === "attending" && recommendedEvents.length > 0 && (
          <div className="bg-white shadow-md rounded-md p-4 w-[700px] mb-6">
            <h2 className="text-xl font-bold mb-4">Recommended Events</h2>
            <RecommendedEvents events={recommendedEvents} />
          </div>
        )}

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
                  Hosted By: {event.hostName} |{" "}
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
              className={`bg-white shadow-md rounded-md p-4 w-[700px] flex items-center mb-4 ${event.disabled ? "opacity-50 pointer-events-none" : ""}`}
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
                <p>Status: <span className="font-semibold">{event.status}</span></p>
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
                <Link href={`/host/EditCancel?event_id=${event.id}&mode=edit`}>
                  <button
                    className="bg-teal-400 text-white px-4 py-1 rounded hover:bg-teal-500 disabled:opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={event.status === "cancelled"} // disable if event canceled
                  >
                    Edit Details
                  </button>
                </Link>

                {/* Old Edit button commented for reference
                <button
                  className="bg-teal-400 text-white px-4 py-1 rounded hover:bg-teal-500"
                  onClick={() => router.push(`/host/CreateEvent?eventId=${event.id}`)}
                >
                  Edit Details
                </button> 
                */}

                <Link href="/groupchat">
                  <button className="border border-teal-400 text-teal-500 px-4 py-1 rounded hover:bg-teal-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={event.status === "cancelled"}>
                    Group Chat
                  </button>
                </Link>

                <Link href={`/host/EditCancel?event_id=${event.id}&mode=cancel`}>
                  <button
                    className="border border-red-400 text-red-500 px-4 py-1 rounded hover:bg-red-100 disabled:opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={event.status === "cancelled"} // disable if event canceled
                  >
                    Cancel Event
                  </button>
                </Link>

                {/* Old Cancel button commented for reference
                <button
                  className="border border-red-400 text-red-500 px-4 py-1 rounded hover:bg-red-100"
                  onClick={async () => {
                    try {
                      await supabase.from("events").delete().eq("id", event.id);
                      const updated = hostedEvents.filter((e) => e.id !== event.id);
                      setHostedEvents(updated);
                    } catch (err) {
                      console.error("Failed to delete event:", err);
                    }
                  }}
                >
                  Cancel Event
                </button>
                */}
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

      {/* Attendee List Modal */}
      {showAttendeeModal && selectedEvent && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-teal-400 to-cyan-500 p-4 text-white">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Attendee List</h2>
                <button
                  onClick={() => setShowAttendeeModal(false)}
                  className="text-white hover:text-gray-200 text-2xl font-bold transition-colors"
                >
                  ×
                </button>
              </div>
              <p className="text-teal-100 text-sm mt-1">
                {selectedEvent.title}
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-4 max-h-96 overflow-y-auto">
              <div className="space-y-3">
                {(selectedEvent.attendeeNames || defaultAttendees).map((name, i) => (
                  <div
                    key={i}
                    className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <span className="font-medium text-gray-800">
                      {name}
                    </span>
                    {name === "Me" && (
                      <span className="ml-auto bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded-full font-medium">
                        Host
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Total attendees: {(selectedEvent.attendeeNames || defaultAttendees).length}</span>
                <span>Capacity: {selectedEvent.capacity || 0}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
