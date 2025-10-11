"use client";
import React, { useState } from "react";

const mockParticipants = [
  { id: 1, name: "Alan Wong", email: "alan@email.com" },
  { id: 2, name: "Sarah Lee", email: "sarah@email.com" },
  { id: 3, name: "Ravi Kumar", email: "ravi@email.com" },
];

export default function ManageParticipants() {
  const [participants, setParticipants] = useState(mockParticipants);

  const handleRemove = (id: number) => {
    setParticipants(participants.filter((p) => p.id !== id));
    alert("Participant removed.");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center p-6">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-6 text-center">
          <span style={{ color: "#1DDACA" }}>Manage</span> Participants
        </h1>

        {participants.length === 0 ? (
          <p className="text-center text-gray-500">No participants yet.</p>
        ) : (
          <ul className="space-y-3">
            {participants.map((p) => (
              <li key={p.id} className="flex justify-between items-center border p-3 rounded-md shadow-sm">
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-sm text-gray-500">{p.email}</p>
                </div>
                <button
                  onClick={() => handleRemove(p.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
