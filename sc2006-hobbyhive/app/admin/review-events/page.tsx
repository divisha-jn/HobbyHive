"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import Header from "@/app/components/header";
import Navbar from "@/app/components/Navbar";
import { useRouter } from "next/navigation";
import AuthWrapper from "@/app/components/AuthWrapper";

interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  location: string;
  host_id: string;
  status: string;
  created_at: string;
}

const ReviewEvents: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    fetchPendingEvents();
  }, []);

  const fetchPendingEvents = async () => {
    setLoading(true);
    console.log("[fetchPendingEvents] Loading pending events...");
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;
      console.log("[fetchPendingEvents] Loaded", data?.length, "events");
      setEvents(data || []);
    } catch (error) {
      console.error("[fetchPendingEvents] Error:", error);
      alert("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveEvent = async (eventId: string, title: string) => {
    const confirmApprove = confirm(`Approve event "${title}"?`);
    if (!confirmApprove) return;

    console.log("[handleApproveEvent] Approving event:", eventId);
    try {
      const { data: eventData, error: fetchError } = await supabase
      .from("events")
      .select("host_id")
      .eq("id", eventId)
      .single();

      if (fetchError || !eventData) throw fetchError;

      const hostId = eventData.host_id;

      const { error } = await supabase
        .from("events")
        .update({ status: "approved" })
        .eq("id", eventId);

      if (error) throw error;

      const { error: participantError } = await supabase
      .from("event_participants")
      .insert([{ event_id: eventId, user_id: hostId }]);
      
      if (participantError) throw participantError;

      alert("✅ Event approved successfully");


      fetchPendingEvents();
    } catch (error) {
      console.error("[handleApproveEvent] Error:", error);
      alert("❌ Failed to approve event");
    }
  };

  const handleRejectEvent = async (eventId: string, title: string) => {
    const reason = prompt(`Reject event "${title}"?\nPlease provide a reason:`);
    if (reason === null) return;

    console.log("[handleRejectEvent] Rejecting event:", eventId);
    try {
      const { error } = await supabase
        .from("events")
        .update({
          status: "rejected",
          rejection_reason: reason,
        })
        .eq("id", eventId);

      if (error) throw error;

      alert("✅ Event rejected successfully");
      fetchPendingEvents();
    } catch (error) {
      console.error("[handleRejectEvent] Error:", error);
      alert("❌ Failed to reject event");
    }
  };

  return (
    <AuthWrapper allowedRoles={["admin"]}>
        <div className="min-h-screen" style={{ backgroundColor: "#A8F0EB" }}>
          <div className="absolute top-4 right-4">
            <button
              onClick={async () => {
                await createClient().auth.signOut();
                router.push("/login");
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700"
            >
              Logout
            </button>
          </div>
          <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Review Event Requests</h1>
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
            No pending events to review
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {event.title}
                    </h3>
                    <p className="text-gray-600 mb-3">{event.description}</p>
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
                        <strong>Submitted:</strong>{" "}
                        {new Date(event.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleApproveEvent(event.id, event.title)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-md"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectEvent(event.id, event.title)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-md"
                    >
                      Reject
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

export default ReviewEvents;
