"use client";
import React, { useState } from "react";
import Header from '../components/header'
import Navbar from "../components/Navbar";

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
  const [isEditing, setIsEditing] = useState(false);
  const [address, setAddress] = useState("50 Nanyang Ave,\nSingapore 639798");
  const [username, setUsername] = useState("johndoe");
  const [email, setEmail] = useState("johndoe123@email.com");
  const [password, setPassword] = useState("pa$$word123!");

  const following: FollowingUser[] = [
    { id: 1, name: "Alan Wong", avatar: "https://i.pravatar.cc/150?img=12" },
  ];

  const groupChats: GroupChat[] = [
    { id: 1, name: "Alan's Badminton ...", avatar: "https://i.pravatar.cc/150?img=13" },
  ];

  const handleEditProfile = () => {
    setIsEditing(!isEditing);
  };

  const handleFindEvents = () => {
    console.log("Navigate to find events");
    // router.push('/events');
  };

  const handleCreateEvent = () => {
    console.log("Navigate to create event");
    // router.push('/create-event');
  };

  const handleFollowingClick = (user: FollowingUser) => {
    console.log("Clicked on following user:", user.name);
    // router.push(`/profile/${user.id}`);
  };

  const handleGroupChatClick = (group: GroupChat) => {
    console.log("Clicked on group chat:", group.name);
    // router.push(`/chat/${group.id}`);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#A8F0EB" }}>

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
                <div className="w-40 h-40 bg-black rounded-full flex items-center justify-center mb-4">
                  <svg className="w-24 h-24 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <button
                  onClick={handleEditProfile}
                  className="px-6 py-2 text-white rounded-lg transition shadow-md hover:opacity-90"
                  style={{ backgroundColor: "#1DDACA" }}
                >
                  ✏️ Edit Profile
                </button>
              </div>

              {/* Stats and Buttons */}
              <div className="flex-1">
                <div className="flex gap-8 mb-6">
                  <div className="text-center">
                    <div className="text-5xl font-bold">0</div>
                    <div className="text-sm text-gray-600">Events<br/>Participated</div>
                  </div>
                  <div className="text-center">
                    <div className="text-5xl font-bold">0</div>
                    <div className="text-sm text-gray-600">Events<br/>Hosted</div>
                  </div>
                </div>

                <div className="flex gap-4 mb-6">
                  <button
                    onClick={handleFindEvents}
                    className="px-6 py-2 text-white rounded-lg transition shadow-md hover:opacity-90"
                    style={{ backgroundColor: "#1DDACA" }}
                  >
                    My Events
                  </button>
                  <button
                    onClick={handleCreateEvent}
                    className="px-6 py-2 text-white rounded-lg transition shadow-md hover:opacity-90"
                    style={{ backgroundColor: "#1DDACA" }}
                  >
                    Create Event
                  </button>
                </div>

                {/* Profile Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 bg-gray-200 rounded resize-none"
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 bg-gray-200 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 bg-gray-200 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 bg-gray-200 rounded"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Following and Group Chats */}
          <div className="space-y-6">
            {/* Following Section */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-xl font-bold mb-4">Following</h2>
              <div className="space-y-2">
                {following.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => handleFollowingClick(user)}
                    className="flex items-center justify-between p-3 hover:bg-gray-100 rounded-lg cursor-pointer transition"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <span className="font-medium">{user.name}</span>
                    </div>
                    <button className="text-gray-500 hover:text-gray-700">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
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
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
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
