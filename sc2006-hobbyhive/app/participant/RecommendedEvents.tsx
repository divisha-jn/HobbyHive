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
  const [isOpen, setIsOpen] = useState(true);


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
    <section className="mt-6 bg-gray-50 border border-gray-200 rounded-xl shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Join Events</h2>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-sm text-blue-600 hover:underline"
       >
          {isOpen ? 'Hide' : 'Show'}
        </button>
      </div>

      {isOpen && (
        <>
          {recommendations.length === 0 ? (
            <p className="text-center text-gray-500 text-sm">
              No available events to join right now.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[250px] overflow-y-auto transition-all duration-300">
              {recommendations.map(event => (
                <div
                  key={event.id}
                  className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition"
                >
                  <h3 className="font-medium text-gray-800">
                    {event.title || event.name}
                  </h3>
                  <p className="text-sm text-gray-600">{event.category}</p>
                  <p className="text-sm text-gray-600">{event.location}</p>

                  {!joinedEventIds.includes(event.id) && (
                    <button
                      onClick={() => handleJoin(event.id)}
                      className="mt-3 w-full px-3 py-1.5 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition"
                    >
                      Join Event
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
       </>
      )}
    </section>
  );

