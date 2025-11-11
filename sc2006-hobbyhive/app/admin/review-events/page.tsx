"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Header from "@/app/components/header";
import AuthWrapper from "@/app/components/AuthWrapper";
import EventController from "../controllers/EventController";
import ReviewEventsView from "../views/ReviewEventsView";
import { Event } from "../models/EventModel";

const ReviewEventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const eventController = new EventController();
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    fetchPendingEvents();
  }, []);

  const fetchPendingEvents = async () => {
    setLoading(true);
    try {
      const data = await eventController.loadPendingEvents();
      setEvents(data);
    } catch (error) {
      alert("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveEvent = async (eventId: string, title: string) => {
    const confirmApprove = confirm(`Approve event "${title}"?`);
    if (!confirmApprove) return;

    try {
      await eventController.approveEvent(eventId);
      alert("✅ Event approved successfully");
      fetchPendingEvents();
    } catch (error) {
      console.error("Failed to approve event:", error);
      alert("❌ Failed to approve event");
    }
  };

  const handleRejectEvent = async (eventId: string, title: string) => {
    const reason = prompt(`Reject event "${title}"?\nPlease provide a reason:`);
    if (reason === null) return;

    try {
      await eventController.rejectEvent(eventId, reason);
      alert("✅ Event rejected successfully");
      fetchPendingEvents();
    } catch (error) {
      console.error("Failed to reject event:", error);
      alert("❌ Failed to reject event");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <AuthWrapper allowedRoles={["admin"]}>
      <Header />
      <ReviewEventsView
        events={events}
        loading={loading}
        onApprove={handleApproveEvent}
        onReject={handleRejectEvent}
        onLogout={handleLogout}
      />
    </AuthWrapper>
  );
};

export default ReviewEventsPage;
