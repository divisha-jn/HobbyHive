'use client';
import React from 'react';
import Link from 'next/link';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  image?: string;
  host?: string;
}

export default function RecommendedEvents({ events }: { events: Event[] }) {
  if (events.length === 0) {
    return (
      <section className="my-6 bg-white shadow-md rounded-md p-4 w-full">
        <h2 className="text-2xl font-semibold mb-3">Recommended Events</h2>
        <p>No recommendations available.</p>
      </section>
    );
  }

  return (
    <section className="my-6 w-full">
      <h2 className="text-2xl font-semibold mb-3">Recommended Events</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((event) => (
          <div key={event.id} className="p-4 bg-blue-50 rounded-md shadow flex flex-col">
            {event.image && (
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-32 object-cover rounded-md mb-2"
              />
            )}
            <h3 className="font-semibold text-lg">{event.title}</h3>
            <p className="text-sm text-gray-700">{event.date} {event.time}</p>
            <p className="text-sm text-gray-700">{event.location}</p>
            {event.host && <p className="text-sm text-gray-500">Hosted by: {event.host}</p>}
            <Link href={`/events/${event.id}`}>
              <button className="mt-auto bg-teal-400 text-white px-4 py-1 rounded hover:bg-teal-500 transition mt-2">
                View Event
              </button>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

