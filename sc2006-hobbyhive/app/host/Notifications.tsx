"use client";
import React, { useState } from "react";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([
    { id: 1, text: "New participant joined your event.", time: "2h ago" },
    { id: 2, text: "Event 'Art Jam' starts tomorrow!", time: "1d ago" },
  ]);

  const clearAll = () => {
    setNotifications([]);
    alert("Notifications cleared.");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center p-6">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-6 text-center">
          <span style={{ color: "#1DDACA" }}>Host</span> Notifications
        </h1>

        {notifications.length === 0 ? (
          <p className="text-center text-gray-500">No new notifications.</p>
        ) : (
          <>
            <ul className="space-y-3 mb-4">
              {notifications.map((n) => (
                <li key={n.id} className="border p-3 rounded-md shadow-sm bg-gray-100">
                  <p>{n.text}</p>
                  <span className="text-sm text-gray-500">{n.time}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={clearAll}
              className="w-full py-2 bg-[#1DDACA] text-white font-semibold rounded hover:opacity-90"
            >
              Clear All
            </button>
          </>
        )}
      </div>
    </div>
  );
}
