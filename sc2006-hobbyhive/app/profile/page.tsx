"use client";

import React, { useState, useEffect } from "react";
import Header from "../components/header";
import Navbar from "../components/Navbar";
import FollowersList from "../components/FollowersList";
import { useRouter } from "next/navigation";
import {
  getCurrentUser,
  fetchProfile,
  updateUsername,
  updatePassword,
  uploadProfilePicture,
} from "@/utils/supabase/account";
import { createClient } from "@/utils/supabase/client";

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [eventsParticipatedCount, setEventsParticipatedCount] = useState(0);
  const [eventsHostedCount, setEventsHostedCount] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  const router = useRouter();
  const supabase = createClient();

  // Load user and profile data
  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await getCurrentUser();
      if (!currentUser) return;
      setUser(currentUser);
      const profileData = await fetchProfile(currentUser.id);
      setProfile(profileData);
      setUsername(profileData.username);
      setEmail(currentUser.email ?? "");
    };
    loadUser();
  }, []);

  // Load hosted & participated event counts + follower counts
  useEffect(() => {
    const loadCounts = async () => {
      if (!user) return;

      try {
        // Count hosted events
        const { data: hostedData, error: hostedError } = await supabase
          .from("events")
          .select("id", { count: "exact" })
          .eq("host_id", user.id)
          .eq("status", "approved");
        if (hostedError) throw hostedError;
        setEventsHostedCount(hostedData?.length ?? 0);

        // Count participated events
        const { data: participantData, error: participantError } = await supabase
          .from("event_participants")
          .select("event_id", { count: "exact" })
          .eq("user_id", user.id);
        if (participantError) throw participantError;
        setEventsParticipatedCount(participantData?.length ?? 0);

        // Count followers
        const { data: followers, error: followersError } = await supabase
          .from("follows")
          .select("follower_id", { count: "exact" })
          .eq("followed_id", user.id);
        if (followersError) throw followersError;
        setFollowersCount(followers?.length ?? 0);

        // Count following
        const { data: following, error: followingError } = await supabase
          .from("follows")
          .select("followed_id", { count: "exact" })
          .eq("follower_id", user.id);
        if (followingError) throw followingError;
        setFollowingCount(following?.length ?? 0);
      } catch (err) {
        console.error("Failed to fetch event counts", err);
      }
    };

    loadCounts();
  }, [user, supabase]);

  const handleFindEvents = () => router.push("/my-events");
  const handleCreateEvent = () => router.push("/host/CreateEvent");

  const handleUpdate = async () => {
    if (!user) return;
    setLoading(true);
    setStatus("");

    try {
      if (username !== profile.username) {
        await updateUsername(user.id, username);
        setStatus((s) => s + " ✅ Username updated.\n");
      }

      if (password.length > 0) {
        try {
          await updatePassword(password);
          setStatus((s) => s + " 🔒 Password updated.\n");
        } catch (err: any) {
          if (err.message.includes("New password should be different")) {
            setStatus((s) => s + " ⚠️ Password unchanged (same as current).\n");
          } else {
            setStatus("❌ Error: " + err.message);
          }
        }
      }

      if (profilePic) {
        const publicUrl = await uploadProfilePicture(user.id, profilePic);
        const cacheBustedUrl = `${publicUrl}?t=${Date.now()}`;
        setProfile((p: any) => ({ ...p, profile_picture: cacheBustedUrl }));
        setStatus((s) => s + " 🖼️ Profile picture updated.\n");
      }

      setPassword("");
    } catch (err: any) {
      setStatus("❌ Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = async () => {
    if (isEditing) {
      await handleUpdate();
    }
    setIsEditing(!isEditing);
  };

  const handleCancelEdit = () => {
    if (profile) {
      setUsername(profile.username);
    }
    setPassword("");
    setProfilePic(null);
    setIsEditing(false);
    setStatus("");
  };

  if (!user) return <p className="p-6 text-center">Loading...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-r from-teal-400 to-cyan-500">
      {/* Navbar wrapper fixes TS error */}
      <div className="absolute top-2 left-4 z-50">
        <Navbar />
      </div>

      <Header />

      <div className="max-w-full mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Profile Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Profile Picture */}
              <div className="flex flex-col items-center">
                <div className="w-40 h-40 bg-gray-200 rounded-full flex items-center justify-center mb-4 overflow-hidden">
                  {profile?.profile_picture ? (
                    <img
                      src={`${profile.profile_picture}?t=${Date.now()}`}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg
                      className="w-24 h-24 text-gray-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>

                {isEditing && (
                  <div className="flex flex-col items-center mt-4 mb-4">
                    <label
                      htmlFor="profilePic"
                      className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded-md shadow-sm transition"
                    >
                      Upload New Photo
                    </label>
                    <input
                      id="profilePic"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setProfilePic(e.target.files?.[0] ?? null)}
                      className="hidden"
                    />
                    {profilePic && (
                      <p className="text-xs text-gray-600 mt-2 truncate max-w-[10rem]">
                        {profilePic.name}
                      </p>
                    )}
                  </div>
                )}

                <button
                  onClick={handleEditProfile}
                  className="px-6 py-2 text-white rounded-lg transition shadow-md hover:opacity-80"
                  style={{ backgroundColor: "#1DDACA" }}
                  disabled={loading}
                >
                  {isEditing ? "💾 Save Changes" : "✏️ Edit Profile"}
                </button>

                {isEditing && (
                  <button
                    onClick={handleCancelEdit}
                    className="border border-red-400 px-4 py-1 rounded hover:bg-red-100 rounded-lg transition shadow-md hover:opacity-80 text-sm mt-2"
                    disabled={loading}
                  >
                    ❌ Cancel
                  </button>
                )}
              </div>

              {/* Stats & Profile Fields */}
              <div className="flex-1">
                {/* Stats Row */}
                <div className="flex gap-6 mb-6 flex-wrap justify-center md:justify-start">
                  <div className="text-center">
                    <div className="text-4xl font-bold">{eventsParticipatedCount}</div>
                    <div className="text-sm text-gray-600">Events Participated</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold">{eventsHostedCount}</div>
                    <div className="text-sm text-gray-600">Events Hosted</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold">{followersCount}</div>
                    <div className="text-sm text-gray-600">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold">{followingCount}</div>
                    <div className="text-sm text-gray-600">Following</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 mb-6">
                  <button
                    onClick={handleFindEvents}
                    className="text-white px-4 py-1 rounded-lg shadow-md hover:opacity-80 transition-colors"
                    style={{ backgroundColor: "#1DDACA" }}
                  >
                    My Events
                  </button>
                  <button
                    onClick={handleCreateEvent}
                    className="px-4 py-2 text-white rounded-lg transition shadow-md hover:opacity-80"
                    style={{ backgroundColor: "#1DDACA" }}
                  >
                    Create Event
                  </button>
                </div>

                {/* Profile Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 bg-gray-200 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="w-full px-3 py-2 bg-gray-200 rounded"
                    />
                  </div>
                  {isEditing && (
                    <div>
                      <label className="block text-base font-medium text-gray-700 mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-200 rounded"
                      />
                    </div>
                  )}
                </div>

                {status && (
                  <pre className="mt-4 p-3 bg-gray-100 text-sm rounded whitespace-pre-wrap">
                    {status}
                  </pre>
                )}
              </div>
            </div>
          </div>

          {/* Followers and Following - Full Width Below */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FollowersList userId={user.id} type="followers" title="My Followers" />
            <FollowersList userId={user.id} type="following" title="I'm Following" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
