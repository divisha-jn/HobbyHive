"use client";
import React, { useState, useEffect } from "react";
import Header from "../components/header";
import Navbar from "../components/Navbar";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
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
  disabled?: boolean;
  isFlagged?: boolean;
}

export default function MyEvents() {
  const [activeTab, setActiveTab] = useState<"attending" | "hosting">("attending");
  const [hostedEvents, setHostedEvents] = useState<Event[]>([]);
  const [attendingEvents, setAttendingEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    fetchMyEvents();
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
      setCurrentUserId(userId);

      const fallbackImage =
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop";

      // Hosted events
      const { data: hostedData, error: hostedError } = await supabase
        .from("events")
        .select("*")
        .eq("host_id", userId)
        .order("date", { ascending: true });

      if (hostedError) throw hostedError;

      const hosted = hostedData?.map((e: any) => ({
        ...e,
        image: e.image_url || fallbackImage,
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

  return (
    <div className="min-h-screen bg-gradient-to-r from-teal-400 to-cyan-500 relative">
      <div className="absolute top-2 left-4 z-50">
        <Navbar />
      </div>
      <Header />

      {/* Summary counts */}
      <div className="flex justify-center mt-8">
        <div className="bg-white/80 rounded-lg shadow-md p-4 w-[700px] flex justify-around text-center">
          <div>
            <h3 className="text-lg font-semibold text-teal-700">Attending</h3>
            <p className="text-2xl font-bold">{attendingEvents.length}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-teal-700">Hosting</h3>
            <p className="text-2xl font-bold">{hostedEvents.length}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
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

      {/* Event Cards */}
      <div className="flex justify-center mt-6 flex-col items-center">
        {activeTab === "attending" ? (
          attendingEvents.length > 0 ? (
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
                    <Link href={`/groupchat/${event.id}`}>
                      <button className="border border-teal-400 text-teal-500 px-4 py-1 rounded hover:bg-teal-100 transition">
                        Group Chat
                      </button>
                    </Link>
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-white font-medium mt-6">No attending events yet.</p>
          )
        ) : hostedEvents.length > 0 ? (
          hostedEvents.map((event) => {
            const isCancelled = event.status === "cancelled";
            return (
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
                  <p>Status: <span className="font-semibold">{event.status}</span></p>

                  <div className="flex space-x-2 mt-2">
                    {/* Group Chat Button */}
                    <Link href={`/groupchat/${event.id}`}>
                      <button className="border border-teal-400 text-teal-500 px-4 py-1 rounded hover:bg-teal-100 transition">
                        Group Chat
                      </button>
                    </Link>

                    {/* Edit Details Button */}
                    <Link href={`/host/EditCancel?event_id=${event.id}&mode=edit`}>
                      <button
                        disabled={isCancelled}
                        className={`border px-4 py-1 rounded transition ${
                          isCancelled
                            ? "border-gray-300 text-gray-400 cursor-not-allowed"
                            : "border-blue-400 text-blue-500 hover:bg-blue-100"
                        }`}
                      >
                        Edit Details
                      </button>
                    </Link>

                    {/* Cancel Event Button */}
                    <Link href={`/host/EditCancel?event_id=${event.id}&mode=cancel`}>
                      <button
                        disabled={isCancelled}
                        className={`border px-4 py-1 rounded transition ${
                          isCancelled
                            ? "border-gray-300 text-gray-400 cursor-not-allowed"
                            : "border-red-400 text-red-500 hover:bg-red-100"
                        }`}
                      >
                        Cancel Event
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
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
    </div>
  );
}
