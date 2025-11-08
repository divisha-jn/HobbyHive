"use client";

import React from "react";

type Member = {
  user_id: string;
  profiles?: { username: string | null } | null;
};

type Props = {
  members: Member[];
  userId: string | null;
  hostId: string | null;
  onLeave: () => void;
  onRemove: (id: string) => void;
  loading: boolean;
};

export default function MemberList({
  members,
  userId,
  hostId,
  onLeave,
  onRemove,
  loading,
}: Props) {
  if (loading) {
    return (
      <div className="fixed bottom-20 right-8 w-64 bg-base-200 rounded-lg p-3 shadow-lg z-10">
        <p className="text-gray-400 italic text-sm">Loading members...</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-100 rounded-lg p-4 border-b border-gray-300">
      {members.length > 0 ? (
        members.map((m, i) => (
          <div
            key={i}
            className="flex items-center justify-between bg-base-300 rounded-lg p-2 mb-2"
          >
            <span className="px-5">{m.profiles?.username ?? "User"}</span>

            {m.user_id === userId && userId !== hostId && (
              <button onClick={onLeave} className="btn btn-xs btn-error">
                leave
              </button>
            )}

            {hostId === userId && m.user_id !== hostId && (
              <button
                onClick={() => onRemove(m.user_id)}
                className="btn btn-xs btn-error"
              >
                remove
              </button>
            )}
          </div>
        ))
      ) : (
        <p className="text-gray-400 italic text-sm">No members found...</p>
      )}
    </div>
  );
}
