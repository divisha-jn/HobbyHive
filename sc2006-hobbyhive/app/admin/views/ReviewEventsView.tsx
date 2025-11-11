import React from "react";
import { useRouter } from "next/navigation";
import { Event } from "../models/EventModel";

interface ReviewEventsViewProps {
  events: Event[];
  loading: boolean;
  onApprove: (eventId: string, title: string) => void;
  onReject: (eventId: string, title: string) => void;
  onLogout: () => void;
}

const ReviewEventsView: React.FC<ReviewEventsViewProps> = ({
  events,
  loading,
  onApprove,
  onReject,
  onLogout,
}) => {
  const router = useRouter();

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#A8F0EB" }}>
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
                      onClick={() => onApprove(event.id, event.title)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-md"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => onReject(event.id, event.title)}
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
  );
};

export default ReviewEventsView;
