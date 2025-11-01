"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import Header from "@/app/components/header";
import { useRouter } from "next/navigation";
import AuthWrapper from "@/app/components/AuthWrapper";
import { AlertCircle, Trash2, X } from "lucide-react";

interface Flag {
  id: string;
  reason: string;
  user_id: string;
  created_at: string;
  flagged_by_username: string;
}

interface FlaggedEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image_url?: string;
  host_id: string;
  hostName: string;
  status: string;
  category: string;
  flagCount: number;
  flags: Flag[];
}

const ModerateEvents: React.FC = () => {
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
        console.error("[checkAdmin] Error:", userError);
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

      if (profileError) {
        console.error("[checkAdmin] Profile error:", profileError);
        router.push("/");
        return;
      }

      if (profile?.role !== "admin") {
        console.error("[checkAdmin] Not an admin user");
        router.push("/");
        return;
      }

      setIsAdmin(true);
      await fetchFlaggedEvents();
    } catch (err) {
      console.error("[checkAdmin] Unexpected error:", err);
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const fetchFlaggedEvents = async () => {
    try {
      console.log("[fetchFlaggedEvents] Loading flagged events...");

      // Get all flags with event details - only show unprocessed flags
      const { data: flagData, error: flagError } = await supabase
        .from("event_flags")
        .select(
          `
          id,
          reason,
          user_id,
          created_at,
          event_id,
          events (
            id,
            title,
            description,
            date,
            time,
            location,
            image_url,
            host_id,
            status,
            category
          )
        `
        )
        .is("admin_action", null)
        .order("created_at", { ascending: false });

      if (flagError) {
        console.error("[fetchFlaggedEvents] Error:", flagError.message);
        throw flagError;
      }

      if (!flagData || flagData.length === 0) {
        console.log("[fetchFlaggedEvents] No flagged events found");
        setFlaggedEvents([]);
        return;
      }

      // Group flags by event_id
      const eventMap = new Map<string, FlaggedEvent>();

      flagData.forEach((flag: any) => {
        const event = flag.events;
        if (!event) return;

        if (!eventMap.has(event.id)) {
          eventMap.set(event.id, {
            id: event.id,
            title: event.title,
            description: event.description,
            date: event.date,
            time: event.time,
            location: event.location,
            image_url: event.image_url,
            host_id: event.host_id,
            hostName: "",
            status: event.status,
            category: event.category,
            flagCount: 0,
            flags: [],
          });
        }

        const eventEntry = eventMap.get(event.id)!;
        eventEntry.flagCount += 1;
        eventEntry.flags.push({
          id: flag.id,
          reason: flag.reason,
          user_id: flag.user_id,
          created_at: flag.created_at,
          flagged_by_username: "",
        });
      });

      // Get host names and flagged by usernames
      const hostIds = Array.from(eventMap.values()).map((e) => e.host_id);
      const userIds = Array.from(eventMap.values())
        .flatMap((e) => e.flags.map((f) => f.user_id))
        .filter((id, index, self) => self.indexOf(id) === index);

      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("id, username")
        .in("id", [...hostIds, ...userIds]);

      if (profileError) {
        console.error("[fetchFlaggedEvents] Profile error:", profileError.message);
      }

      // Apply host names and flagged by usernames
      const eventsWithNames = Array.from(eventMap.values())
        .map((event) => ({
          ...event,
          hostName:
            profiles?.find((p) => p.id === event.host_id)?.username || "Unknown",
          flags: event.flags.map((flag) => ({
            ...flag,
            flagged_by_username:
              profiles?.find((p) => p.id === flag.user_id)?.username ||
              "Unknown",
          })),
        }))
        .sort((a, b) => b.flagCount - a.flagCount); // Sort by flag count DESC

      console.log("[fetchFlaggedEvents] Loaded", eventsWithNames.length, "flagged events");
      setFlaggedEvents(eventsWithNames);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("[fetchFlaggedEvents] Error:", errorMessage);
      alert("Failed to load flagged events: " + errorMessage);
    }
  };

  const handleDeleteEvent = async () => {
    if (!eventToDelete || !currentUserId) return;

    setIsProcessing(true);
    console.log("[handleDeleteEvent] Deleting event:", eventToDelete.id);

    try {
      // Step 1: Mark all unprocessed flags as 'deleted_event' (keep for audit trail)
      const { error: flagUpdateError } = await supabase
        .from("event_flags")
        .update({
          admin_action: "deleted_event",
          admin_id: currentUserId,
          action_taken_at: new Date().toISOString(),
        })
        .eq("event_id", eventToDelete.id)
        .is("admin_action", null); // Only update unprocessed flags

      if (flagUpdateError) throw flagUpdateError;

      // Step 2: Delete all participants
      const { error: participantError } = await supabase
        .from("event_participants")
        .delete()
        .eq("event_id", eventToDelete.id);

      if (participantError) throw participantError;

      // Step 3: Delete the event
      const { error: eventError } = await supabase
        .from("events")
        .delete()
        .eq("id", eventToDelete.id);

      if (eventError) throw eventError;

      alert("✅ Event deleted successfully");

      setShowDeleteConfirm(false);
      setEventToDelete(null);
      setShowFlagsModal(false);
      setSelectedEvent(null);

      fetchFlaggedEvents();
    } catch (error) {
      console.error("[handleDeleteEvent] Error:", error);
      alert(
        "❌ Failed to delete event: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearFlag = async (flagId: string, eventId: string) => {
    setIsProcessing(true);
    console.log("[handleClearFlag] Clearing flag:", flagId);

    try {
      // Update flag to mark as 'removed_flag' (not deleted, just marked)
      const { error } = await supabase
        .from("event_flags")
        .update({
          admin_action: "removed_flag",
          admin_id: currentUserId,
          action_taken_at: new Date().toISOString(),
        })
        .eq("id", flagId);

      if (error) throw error;

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
      console.error("[handleClearFlag] Error:", error);
      alert(
        "❌ Failed to clear flag: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-teal-400 to-cyan-500 flex items-center justify-center">
        <div className="text-white text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
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
      <div className="min-h-screen" style={{ backgroundColor: "#A8F0EB" }}>
        {/* Logout button */}
        <div className="absolute top-4 right-4">
          <button
            onClick={async () => {
              await supabase.auth.signOut();
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
            <h1 className="text-3xl font-bold text-gray-800">Moderate Events</h1>
            <button
              onClick={() => router.push("/admin")}
              className="px-4 py-2 text-white rounded-lg shadow-md hover:opacity-80"
              style={{ backgroundColor: "#1DDACA" }}
            >
              ← Back to Dashboard
            </button>
          </div>

          {flaggedEvents.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <AlertCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-semibold">
                No flagged events at the moment
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {flaggedEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-white rounded-lg shadow-md p-6"
                >
                  <div className="flex gap-4">
                    {event.image_url && (
                      <img
                        src={event.image_url}
                        alt={event.title}
                        className="w-24 h-24 rounded-lg object-cover"
                      />
                    )}

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h2 className="text-xl font-semibold text-gray-800">
                            {event.title}
                          </h2>
                          <p className="text-sm text-gray-600">
                            Hosted by:{" "}
                            <span className="font-semibold">{event.hostName}</span>
                          </p>
                          <p className="text-sm text-gray-600">
                            Category:{" "}
                            <span className="font-semibold">{event.category}</span>
                          </p>
                        </div>
                        <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full font-semibold text-sm">
                          {event.flagCount} Flag
                          {event.flagCount !== 1 ? "s" : ""}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-4 text-sm text-gray-600">
                        <div>
                          <span className="font-semibold">Date:</span> {event.date}
                        </div>
                        <div>
                          <span className="font-semibold">Time:</span> {event.time}
                        </div>
                        <div>
                          <span className="font-semibold">Status:</span>{" "}
                          <span className="capitalize font-semibold text-gray-800">
                            {event.status}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-4">
                        <span className="font-semibold">Location:</span>{" "}
                        {event.location}
                      </p>

                      {event.description && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          <span className="font-semibold">Description:</span>{" "}
                          {event.description}
                        </p>
                      )}

                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setSelectedEvent(event);
                            setShowFlagsModal(true);
                          }}
                          className="px-4 py-2 text-white rounded-lg hover:opacity-80 shadow-md"
                          style={{ backgroundColor: "#1DDACA" }}
                        >
                          View {event.flagCount} Flag
                          {event.flagCount !== 1 ? "s" : ""}
                        </button>

                        <button
                          onClick={() => {
                            setEventToDelete(event);
                            setShowDeleteConfirm(true);
                          }}
                          disabled={isProcessing}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-md flex items-center gap-2 disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete Event
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Flags Modal */}
      {showFlagsModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div
              className="p-6 text-white flex justify-between items-start"
              style={{ backgroundColor: "#1DDACA" }}
            >
              <div>
                <h2 className="text-2xl font-bold">{selectedEvent.title}</h2>
                <p className="text-teal-100 mt-1">
                  {selectedEvent.flagCount} Flag
                  {selectedEvent.flagCount !== 1 ? "s" : ""}
                </p>
              </div>
              <button
                onClick={() => setShowFlagsModal(false)}
                className="text-white hover:text-gray-200 text-2xl font-bold transition-colors"
              >
                ×
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-6">
              <div className="space-y-4">
                {selectedEvent.flags.map((flag, index) => (
                  <div
                    key={flag.id}
                    className="border border-gray-300 rounded-lg p-4 bg-gray-50"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 mb-2">
                          <span className="font-semibold">Flag #{index + 1}</span>
                          {" by "}
                          <span className="font-semibold">
                            {flag.flagged_by_username}
                          </span>
                        </p>
                        <p className="text-gray-800 break-words">{flag.reason}</p>
                      </div>
                      <button
                        onClick={() => handleClearFlag(flag.id, selectedEvent.id)}
                        disabled={isProcessing}
                        className="ml-4 p-2 hover:bg-red-100 rounded-lg transition disabled:opacity-50"
                        title="Clear this flag"
                      >
                        <X className="w-5 h-5 text-red-500" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(flag.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-100 px-6 py-4 border-t border-gray-200">
              <button
                onClick={() => setShowFlagsModal(false)}
                className="w-full px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && eventToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Delete Event?
            </h3>
            <p className="text-gray-600 mb-2">
              <strong>Event:</strong> {eventToDelete.title}
            </p>
            <p className="text-gray-600 mb-2">
              <strong>Hosted by:</strong> {eventToDelete.hostName}
            </p>
            <p className="text-gray-600 mb-4">
              This action will permanently delete the event and remove all
              participants. All associated flags will be marked as 'deleted_event'
              for the audit trail. This cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setEventToDelete(null);
                }}
                disabled={isProcessing}
                className="flex-1 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition font-semibold disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteEvent}
                disabled={isProcessing}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold disabled:opacity-50"
              >
                {isProcessing ? "Deleting..." : "Delete Event"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthWrapper>
  );
};

export default ModerateEvents;
