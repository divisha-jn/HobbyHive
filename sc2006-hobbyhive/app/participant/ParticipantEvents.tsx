'use client';
import React from 'react';

export default function ParticipantEvents({ events }: { events: any[] }) {
  return (
    <section className="my-4">
      <h2 className="text-2xl font-semibold mb-2">Joined Events</h2>
      {events.length === 0 ? (
        <p>No events joined yet.</p>
      ) : (
        <ul className="space-y-2">
          {events.map((event) => (
            <li key={event.id} className="p-4 bg-gray-100 rounded-md shadow">
              <h3 className="font-bold">{event.name}</h3>
              <p>{event.date} — {event.location}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

