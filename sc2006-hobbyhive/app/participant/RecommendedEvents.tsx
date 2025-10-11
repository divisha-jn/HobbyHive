'use client';
import React from 'react';

export default function RecommendedEvents({ events }: { events: any[] }) {
  return (
    <section className="my-6">
      <h2 className="text-2xl font-semibold mb-3">Recommended Events</h2>
      {events.length === 0 ? (
        <p>No recommendations available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
            <div key={event.id} className="p-4 bg-blue-50 rounded-md shadow">
              <h3 className="font-semibold">{event.name}</h3>
              <p>{event.category}</p>
              <p>{event.location}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

