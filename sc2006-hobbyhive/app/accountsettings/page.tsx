"use client";

import { useState, useEffect } from "react";
import {
  getCurrentUser,
  fetchProfile,
  updateUsername,
  updatePassword,
  uploadProfilePicture,
} from "@/utils/supabase/account";
import Header from "../components/header";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

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

      setPassword(""); // reset password field
    } catch (err: any) {
      setStatus("❌ Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <main>
        <Header />
            <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg">
            <h1 className="text-xl font-semibold mb-4">Edit Profile</h1>

            <label className="block mb-2">Username</label>
            <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="border p-2 w-full rounded"
            />

            <label className="block mt-4 mb-2">Email</label>
            <input
                value={email}
                disabled
                className="border p-2 w-full rounded bg-gray-100"
            />

            <label className="block mt-4 mb-2">New Password (optional)</label>
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border p-2 w-full rounded"
            />

            <label className="block mt-4 mb-2">Profile Picture</label>
            <input
                type="file"
                accept="image/*"
                onChange={(e) => setProfilePic(e.target.files?.[0] ?? null)}
                className="border p-2 w-full rounded"
            />

            {profile?.profile_picture && (
                <img
                    src={`${profile?.profile_picture}?t=${Date.now()}`}
                alt="Profile"
                className="mt-3 w-24 h-24 rounded-full object-cover"
                />
                
            )}

            <button
            onClick={handleUpdate}
            disabled={
                loading ||
                (!profilePic &&
                username === profile?.username &&
                email === user?.email &&
                !password)
            }
            className="mt-6 bg-blue-600 text-white py-2 px-4 rounded w-full hover:bg-blue-700 disabled:bg-gray-400"
            >
            {loading ? "Updating..." : "Save Changes"}
            </button>

            {status && (
                <pre className="mt-4 p-2 bg-gray-100 text-sm rounded whitespace-pre-wrap">{status}</pre>
            )}
            </div>
    </main>
  );
}
