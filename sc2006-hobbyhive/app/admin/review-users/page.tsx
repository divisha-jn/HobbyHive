"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import Header from "@/app/components/header";
import Navbar from "@/app/components/Navbar";
import { useRouter } from "next/navigation";
import AuthWrapper from "@/app/components/AuthWrapper";

interface User {
  id: string;
  username: string;
  email: string;
  is_flagged: boolean;
  flag_reason: string | null;
  is_banned: boolean;
  created_at: string;
}

const ReviewUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchUsername, setSearchUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [showFlaggedOnly, setShowFlaggedOnly] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    fetchUsers();
  }, [showFlaggedOnly]);

  const fetchUsers = async () => {
    setLoading(true);
    console.log("[fetchUsers] Loading users...");
    try {
      let query = supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (showFlaggedOnly) {
        query = query.eq("is_flagged", true);
      }

      const { data, error } = await query;

      if (error) throw error;
      console.log("[fetchUsers] Loaded", data?.length, "users");
      setUsers(data || []);
    } catch (error) {
      console.error("[fetchUsers] Error:", error);
      alert("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const searchUser = async () => {
    if (!searchUsername.trim()) {
      fetchUsers();
      return;
    }

    setLoading(true);
    console.log("[searchUser] Searching for:", searchUsername);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .ilike("username", `%${searchUsername}%`);

      if (error) throw error;
      console.log("[searchUser] Found", data?.length, "users");
      setUsers(data || []);
    } catch (error) {
      console.error("[searchUser] Error:", error);
      alert("Failed to search user");
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async (userId: string, username: string) => {
    const duration = prompt("Ban duration in days (leave empty for permanent):");
    const reason = prompt("Reason for ban:");

    if (reason === null) return;

    const confirmBan = confirm(`Ban user "${username}"?`);
    if (!confirmBan) return;

    console.log("[handleBanUser] Banning user:", userId);
    try {
      const banUntil = duration
        ? new Date(Date.now() + parseInt(duration) * 24 * 60 * 60 * 1000).toISOString()
        : null;

      const { error } = await supabase
        .from("profiles")
        .update({
          is_banned: true,
          ban_reason: reason,
          banned_until: banUntil,
        })
        .eq("id", userId);

      if (error) throw error;

      alert(`✅ User banned successfully`);
      fetchUsers();
    } catch (error) {
      console.error("[handleBanUser] Error:", error);
      alert("❌ Failed to ban user");
    }
  };

  const handleUnflagUser = async (userId: string, username: string) => {
    const confirmUnflag = confirm(`Remove flag from user "${username}"?`);
    if (!confirmUnflag) return;

    console.log("[handleUnflagUser] Unflagging user:", userId);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          is_flagged: false,
          flag_reason: null,
        })
        .eq("id", userId);

      if (error) throw error;

      alert("✅ User unflagged successfully");
      fetchUsers();
    } catch (error) {
      console.error("[handleUnflagUser] Error:", error);
      alert("❌ Failed to unflag user");
    }
  };

  return (
    <AuthWrapper allowedRoles={["admin"]}>
    <div className="min-h-screen" style={{ backgroundColor: "#A8F0EB" }}>
      <div className="absolute top-2 left-4 z-50">
        <Navbar />
      </div>
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Review Users</h1>
          <button
            onClick={() => router.push("/admin")}
            className="px-4 py-2 text-white rounded-lg shadow-md hover:opacity-80"
            style={{ backgroundColor: "#1DDACA" }}
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              placeholder="Search by username..."
              value={searchUsername}
              onChange={(e) => setSearchUsername(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={searchUser}
              className="px-6 py-2 text-white rounded-lg shadow-md hover:opacity-80"
              style={{ backgroundColor: "#1DDACA" }}
            >
              Search
            </button>
          </div>

          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={showFlaggedOnly}
              onChange={(e) => setShowFlaggedOnly(e.target.checked)}
              className="mr-2 w-4 h-4"
            />
            <span className="text-gray-700">Show flagged users only</span>
          </label>
        </div>

        {/* Users List */}
        {loading ? (
          <div className="text-center py-8 text-gray-700">Loading...</div>
        ) : users.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
            No users found
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-semibold text-gray-800">
                        {user.username}
                      </h3>
                      {user.is_flagged && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">
                          FLAGGED
                        </span>
                      )}
                      {user.is_banned && (
                        <span className="px-2 py-1 bg-gray-800 text-white text-xs rounded-full font-medium">
                          BANNED
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-1">{user.email}</p>
                    <p className="text-sm text-gray-500">
                      Joined: {new Date(user.created_at).toLocaleDateString()}
                    </p>
                    {user.is_flagged && user.flag_reason && (
                      <p className="mt-2 text-sm text-red-600">
                        <strong>Flag Reason:</strong> {user.flag_reason}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {user.is_flagged && (
                      <button
                        onClick={() => handleUnflagUser(user.id, user.username)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-md"
                      >
                        Unflag
                      </button>
                    )}
                    {!user.is_banned && (
                      <button
                        onClick={() => handleBanUser(user.id, user.username)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-md"
                      >
                        Ban User
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </AuthWrapper>
  );
};

export default ReviewUsers;
