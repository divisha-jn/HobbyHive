"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

interface Follower {
  id: string;
  username: string;
  profile_picture: string;
}

interface FollowersListProps {
  userId: string;
  type: "followers" | "following"; // Which list to show
  title?: string;
}

export default function FollowersList({ userId, type, title }: FollowersListProps) {
  const [users, setUsers] = useState<Follower[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    fetchList();
  }, [userId, type]);

  const fetchList = async () => {
    try {
      if (type === "followers") {
        // Get all users who follow this user
        const { data, error } = await supabase
          .from("follows")
          .select(`
            follower_id,
            profiles!follows_follower_id_fkey (
              id,
              username,
              profile_picture
            )
          `)
          .eq("followed_id", userId);

        if (error) throw error;

        const followersList = data?.map((item: any) => ({
          id: item.profiles.id,
          username: item.profiles.username,
          profile_picture: item.profiles.profile_picture,
        })) || [];

        setUsers(followersList);
      } else {
        // Get all users this user is following
        const { data, error } = await supabase
          .from("follows")
          .select(`
            followed_id,
            profiles!follows_followed_id_fkey (
              id,
              username,
              profile_picture
            )
          `)
          .eq("follower_id", userId);

        if (error) throw error;

        const followingList = data?.map((item: any) => ({
          id: item.profiles.id,
          username: item.profiles.username,
          profile_picture: item.profiles.profile_picture,
        })) || [];

        setUsers(followingList);
      }
    } catch (err) {
      console.error("Error fetching list:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="text-lg font-bold mb-4">{title || type}</h2>
        <p className="text-gray-500 text-center py-4">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-lg font-bold mb-4">{title || type}</h2>
      
      {users.length === 0 ? (
        <p className="text-center text-gray-500 py-4">
          No {type} yet
        </p>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {users.map((user) => (
            <div
              key={user.id}
              onClick={() => router.push(`/participant/${user.id}`)}
              className="flex items-center gap-3 p-3 hover:bg-gray-100 rounded-lg cursor-pointer transition"
            >
              {user.profile_picture ? (
                <img
                        src={user.profile_picture}
                        alt={user.username}
                         className="w-10 h-10 rounded-full"
                />
                ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-sm font-bold text-gray-600">
                 {user.username.charAt(0).toUpperCase()}
                </div>
                )}
              <span className="font-medium text-sm">{user.username}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
