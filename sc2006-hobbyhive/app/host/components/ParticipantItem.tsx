"use client";
import React from "react";

interface Participant {
  id: number;
  name: string;
  email: string;
}

interface ParticipantItemProps {
  participant: Participant;
  onRemove: (id: number) => void;
}

export default function ParticipantItem({ participant, onRemove }: ParticipantItemProps) {
  return (
    <li className="flex justify-between items-center border p-3 rounded-md shadow-sm">
      <div>
        <p className="font-medium">{participant.name}</p>
        <p className="text-sm text-gray-500">{participant.email}</p>
      </div>
      <button
        onClick={() => onRemove(participant.id)}
        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
      >
        Remove
      </button>
    </li>
  );
}
