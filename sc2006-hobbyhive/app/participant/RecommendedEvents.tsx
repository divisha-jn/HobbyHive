'use client';
import React, { useState, useEffect } from 'react';
import { joinEvent } from '@/utils/supabase/participantService';

interface Event {
  id: string;
  title?: string;
  name?: string;
  category?: string;
  location?: string;
}

export default function RecommendedEvents({
  events,
  joinedEventIds,
  onJoin
}: {
  events: Event[];
  joinedEventIds: string[];
  onJoin: (eventId: string) => void;
}) {
  const [recommendations, setRecommendations] = useState(events);

  useEffect(() => {
    setRecommendations(events);
  }, [events]);

  const handleJoin = async (eventId: string) => {
    const success = await joinEvent(eventId);
    if (success) {
      setRecommendations(prev => prev.filter(e => e.id !== eventId));
      onJoin(eventId);
    }
  };

  if (recommendations.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-[90%] sm:w-[70%] md:w-[60%] lg:w-[50%] z-50">
      <div className="bg-white border border-gray-300 rounded-2xl shadow-xl p-4">
        <h2 className="text-xl font-semibold mb-3 text-center">
          Join Events
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
          {recommendations.map(event => (
            <div key={event.id} className="p-3 bg-blue-50 rounded-md shadow-sm">
              <h3 className="font-semibold">{event.title || event.name}</h3>
              <p className="text-sm text-gray-600">{event.category}</p>
              <p className="text-sm text-gray-600">{event.location}</p>
              {!joinedEventIds.includes(event.id) && (
                <button
                  onClick={() => handleJoin(event.id)}
                  className="mt-2 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition text-sm"
                >
                  Join Event
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

