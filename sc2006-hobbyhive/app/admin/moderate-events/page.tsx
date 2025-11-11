"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Header from "@/app/components/header";
import AuthWrapper from "@/app/components/AuthWrapper";
import EventController from "../controllers/EventController";
import FlagController from "../controllers/FlagController";
import ModerateEventsView from "../views/ModerateEventsView";
import { FlaggedEvent } from "../models/EventModel";

const ModerateEventsPage: React.FC = () => {
  const [flaggedEvents, setFlaggedEvents] = useState<FlaggedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Modal states
  const [showFlagsModal, setShowFlagsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<FlaggedEvent | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<FlaggedEvent | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const eventController = new EventController();
  const flagController = new FlagController();
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    checkAdminAndFetchEvents();
  }, []);

  const checkAdminAndFetchEvents = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("Error:", userError);
        router.push("/login");
        return;
      }

      setCurrentUserId(user.id);

      // Check if user is admin
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError || profile?.role !== "admin") {
        console.error("Not an admin user");
        router.push("/");
        return;
      }

      setIsAdmin(true);
      await fetchFlaggedEvents();
    } catch (err) {
      console.error("Unexpected error:", err);
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const fetchFlaggedEvents = async () => {
    try {
      const data = await eventController.loadFlaggedEvents();
      setFlaggedEvents(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert("Failed to load flagged events: " + errorMessage);
    }
  };

  const handleDeleteEvent = async () => {
    if (!eventToDelete || !currentUserId) return;

    setIsProcessing(true);
    try {
      await eventController.deleteEvent(eventToDelete.id, currentUserId);
      alert("✅ Event deleted successfully");

      setShowDeleteConfirm(false);
      setEventToDelete(null);
      setShowFlagsModal(false);
      setSelectedEvent(null);

      fetchFlaggedEvents();
    } catch (error) {
      console.error("Failed to delete event:", error);
      alert(
        "❌ Failed to delete event: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearFlag = async (flagId: string, eventId: string) => {
    if (!currentUserId) return;

    setIsProcessing(true);
    try {
      await flagController.clearFlag(flagId, currentUserId);
      alert("✅ Flag cleared successfully");

      // Update local state to remove from display
      setFlaggedEvents((prev) =>
        prev
          .map((event) => {
            if (event.id === eventId) {
              const updatedFlags = event.flags.filter((f) => f.id !== flagId);
              return {
                ...event,
                flagCount: updatedFlags.length,
                flags: updatedFlags,
              };
            }
            return event;
          })
          .filter((event) => event.flagCount > 0)
      );

      // Update selected event if modal is open
      if (selectedEvent?.id === eventId) {
        const updatedFlags = selectedEvent.flags.filter((f) => f.id !== flagId);
        if (updatedFlags.length === 0) {
          setShowFlagsModal(false);
          setSelectedEvent(null);
        } else {
          setSelectedEvent((prev) =>
            prev
              ? {
                  ...prev,
                  flagCount: updatedFlags.length,
                  flags: updatedFlags,
                }
              : null
          );
        }
      }
    } catch (error) {
      console.error("Failed to clear flag:", error);
      alert(
        "❌ Failed to clear flag: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (!isAdmin && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-teal-400 to-cyan-500 flex items-center justify-center">
        <div className="text-white text-xl font-semibold">
          Access Denied: Admin only
        </div>
      </div>
    );
  }

  return (
    <AuthWrapper allowedRoles={["admin"]}>
      <Header />
      <ModerateEventsView
        flaggedEvents={flaggedEvents}
        loading={loading}
        selectedEvent={selectedEvent}
        showFlagsModal={showFlagsModal}
        showDeleteConfirm={showDeleteConfirm}
        eventToDelete={eventToDelete}
        isProcessing={isProcessing}
        onViewFlags={(event) => {
          setSelectedEvent(event);
          setShowFlagsModal(true);
        }}
        onCloseFlagsModal={() => setShowFlagsModal(false)}
        onShowDeleteConfirm={(event) => {
          setEventToDelete(event);
          setShowDeleteConfirm(true);
        }}
        onCancelDelete={() => {
          setShowDeleteConfirm(false);
          setEventToDelete(null);
        }}
        onConfirmDelete={handleDeleteEvent}
        onClearFlag={handleClearFlag}
        onLogout={handleLogout}
      />
    </AuthWrapper>
  );
};

export default ModerateEventsPage;
