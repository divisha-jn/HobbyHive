'use client';
import React, { useEffect, useState } from 'react';
import { getFollowedUsers } from '@/utils/supabase/participantService';

export default function FollowedUsers() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    async function loadFollowed() {
      const data = await getFollowedUsers();
      setUsers(data);
    }
    loadFollowed();
  }, []);

  return (
    <section className="my-6">
      <h2 className="text-2xl font-semibold mb-3">Followed Users</h2>
      {users.length === 0 ? (
        <p>You are not following anyone yet.</p>
      ) : (
        <ul className="list-disc pl-6">
          {users.map((user) => (
            <li key={user.id}>{user.username}</li>
          ))}
        </ul>
      )}
    </section>
  );
}

