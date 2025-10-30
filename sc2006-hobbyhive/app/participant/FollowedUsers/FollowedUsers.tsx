'use client';
import React, { useEffect, useState } from 'react';
import { getFollowedUsers } from '@/utils/supabase/participantService';

interface FollowedUser {
  followed_user_id: string;
  users: {
    username: string;
    avatar?: string;
  };
}

export default function FollowingSection() {
  const [users, setUsers] = useState<FollowedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    async function loadFollowing() {
      const data = await getFollowedUsers();
      setUsers(data);
      setLoading(false);
    }
    loadFollowing();
  }, []);

  const handleFollowingClick = (user: FollowedUser) => {
    console.log('Clicked on:', user.users?.username);
  };

  const handleUnfollow = (userId: string) => {
    setUsers(users.filter(user => user.followed_user_id !== userId));
    setOpenMenuId(null);
  };

  const handleBlock = (userId: string) => {
    console.log('Blocked user:', userId);
    setUsers(users.filter(user => user.followed_user_id !== userId));
    setOpenMenuId(null);
  };

  const filteredFollowing = users.filter(user =>
    user.users?.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="text-xl font-bold mb-4">Following</h2>
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-xl font-bold mb-4">Following</h2>

      {/* Search Input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search following..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-2">
        {filteredFollowing.length > 0 ? (
          filteredFollowing.map((user) => (
            <div key={user.followed_user_id} className="relative">
              <div
                onClick={() => handleFollowingClick(user)}
                className="flex items-center justify-between p-3 hover:bg-gray-100 rounded-lg cursor-pointer transition"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={user.users?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.users?.username}`}
                    alt={user.users?.username}
                    className="w-10 h-10 rounded-full"
                  />
                  <span className="font-medium">{user.users?.username}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuId(openMenuId === user.followed_user_id ? null : user.followed_user_id);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                  </svg>
                </button>
              </div>

              {/* Dropdown Menu */}
              {openMenuId === user.followed_user_id && (
                <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <button
                    onClick={() => handleUnfollow(user.followed_user_id)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 hover:text-gray-900 transition"
                  >
                    Unfollow
                  </button>
                  <button
                    onClick={() => handleBlock(user.followed_user_id)}
                    className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 hover:text-red-700 transition border-t border-gray-200"
                  >
                    Block User
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 py-4">
            {searchQuery ? 'No users found' : 'You are not following anyone yet'}
          </p>
        )}
      </div>
    </div>
  );
}