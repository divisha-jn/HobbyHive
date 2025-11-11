import React from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Trash2, X } from "lucide-react";
import { FlaggedEvent, Flag } from "../models/EventModel";

interface ModerateEventsViewProps {
  flaggedEvents: FlaggedEvent[];
  loading: boolean;
  selectedEvent: FlaggedEvent | null;
  showFlagsModal: boolean;
  showDeleteConfirm: boolean;
  eventToDelete: FlaggedEvent | null;
  isProcessing: boolean;
  onViewFlags: (event: FlaggedEvent) => void;
  onCloseFlagsModal: () => void;
  onShowDeleteConfirm: (event: FlaggedEvent) => void;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
  onClearFlag: (flagId: string, eventId: string) => void;
  onLogout: () => void;
}

const ModerateEventsView: React.FC<ModerateEventsViewProps> = ({
  flaggedEvents,
  loading,
  selectedEvent,
  showFlagsModal,
  showDeleteConfirm,
  eventToDelete,
  isProcessing,
  onViewFlags,
  onCloseFlagsModal,
  onShowDeleteConfirm,
  onCancelDelete,
  onConfirmDelete,
  onClearFlag,
  onLogout,
}) => {
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-teal-400 to-cyan-500 flex items-center justify-center">
        <div className="text-white text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#A8F0EB" }}>
      {/* Logout button */}
      <div className="absolute top-4 right-4">
        <button
          onClick={onLogout}
          className="px-4 py-2 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700"
        >
          Logout
        </button>
      </div>

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
              <div key={event.id} className="bg-white rounded-lg shadow-md p-6">
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
                        onClick={() => onViewFlags(event)}
                        className="px-4 py-2 text-white rounded-lg hover:opacity-80 shadow-md"
                        style={{ backgroundColor: "#1DDACA" }}
                      >
                        View {event.flagCount} Flag
                        {event.flagCount !== 1 ? "s" : ""}
                      </button>

                      <button
                        onClick={() => onShowDeleteConfirm(event)}
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
                onClick={onCloseFlagsModal}
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
                        onClick={() => onClearFlag(flag.id, selectedEvent.id)}
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
                onClick={onCloseFlagsModal}
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
                onClick={onCancelDelete}
                disabled={isProcessing}
                className="flex-1 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition font-semibold disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={onConfirmDelete}
                disabled={isProcessing}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold disabled:opacity-50"
              >
                {isProcessing ? "Deleting..." : "Delete Event"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModerateEventsView;
