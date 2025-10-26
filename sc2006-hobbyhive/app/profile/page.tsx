"use client";

import React, { useState, useEffect } from "react";
import Header from "../components/header";
import Navbar from "../components/Navbar";
import { useRouter } from "next/navigation";
import {
  getCurrentUser,
  fetchProfile,
  updateUsername,
  updatePassword,
  uploadProfilePicture,
} from "@/utils/supabase/account";
import FollowedUsers from "../participant/FollowedUsers/FollowedUsers";

interface FollowingUser {
  id: number;
  name: string;
  avatar: string;
}

interface GroupChat {
  id: number;
  name: string;
  avatar: string;
}

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [address, setAddress] = useState("50 Nanyang Ave,\nSingapore 639798");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  const following: FollowingUser[] = [
    { id: 1, name: "Alan Wong", avatar: "https://i.pravatar.cc/150?img=12" },
  ];

  const groupChats: GroupChat[] = [
    { id: 1, name: "Alan's Badminton ...", avatar: "https://i.pravatar.cc/150?img=13" },
  ];

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

  const handleFindEvents = () => router.push("/MyEvents");
  const handleCreateEvent = () => router.push("/host/CreateEvent");
  const handleParticipantDashboard = () => router.push("/participant");
  

  const handleFollowingClick = (user: FollowingUser) => {
    console.log("Clicked on following user:", user.name);
    // router.push(`/profile/${user.id}`);
  };

  const handleGroupChatClick = (group: GroupChat) => {
    console.log("Clicked on group chat:", group.name);
    // router.push(`/chat/${group.id}`);
  };

  // Supabase update logic
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
    // Reset all fields to their original values
    if (profile) {
      setUsername(profile.username);
    }
    //setAddress();
    setPassword("");
    setProfilePic(null);
    setIsEditing(false);
    setStatus("");
  };

  if (!user) return <p className="p-6 text-center">Loading...</p>;

  return (
    <div className="bg-gradient-to-r from-teal-400 to-cyan-500">
      {/* Navbar */}
      <div className="absolute top-2 left-4 z-50">
        <Navbar />
      </div>

      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Profile Picture */}
              <div className="flex flex-col items-center">
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
                    <div className="flex flex-col items-center mt-4 mb-4"> {/* Added margin top/bottom */}
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
                </div>


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

              {/* Stats and Profile Fields */}
              <div className="flex-1">
                <div className="flex gap-20 mb-6">
                  <div className="text-center">
                    <div className="text-5xl font-bold">1</div>
                    <div className="text-sm text-gray-600">
                      Events
                      <br />
                      Participated
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-5xl font-bold">1</div>
                    <div className="text-sm text-gray-600">
                      Events
                      <br />
                      Hosted
                    </div>
                  </div>
                </div>

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
                  <button
                    onClick={handleParticipantDashboard}
                    className="text-white px-4 py-1 rounded-lg shadow-md hover:opacity-80 transition-colors"
                    style={{ backgroundColor: "#1DDACA" }}
                  >
                    Participant Dashboard
                  </button>
                </div>

                {/* Profile Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 bg-gray-200 rounded resize-none"
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">
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

                {/* Status Feedback */}
                {status && (
                  <pre className="mt-4 p-3 bg-gray-100 text-sm rounded whitespace-pre-wrap">
                    {status}
                  </pre>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Following and Group Chats */}
          <div className="space-y-6">
            {/* Following Section */}
              <div className="space-y-2">
                <FollowedUsers />
              </div>

            {/* Group Chats Section */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-xl font-bold mb-4">Group Chats</h2>
              <div className="space-y-2">
                {groupChats.map((group) => (
                  <div
                    key={group.id}
                    onClick={() => handleGroupChatClick(group)}
                    className="flex items-center justify-between p-3 hover:bg-gray-100 rounded-lg cursor-pointer transition"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={group.avatar}
                        alt={group.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <span className="font-medium">{group.name}</span>
                    </div>
                    <button className="text-gray-500 hover:text-gray-700">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
