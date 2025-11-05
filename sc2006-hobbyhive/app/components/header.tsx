// components/Header.tsx
"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { getCurrentUser, fetchProfile, logout } from "@/utils/supabase/account";
import Link from "next/link";
interface UserState {
  email: string | null;
  username?: string | null;
  profile_picture?: string | null;
  role?: string | null;
}
const Header = () => {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<UserState | null>(null);

  const loadUser = async () => {
  const currentUser = await getCurrentUser();
  if (currentUser) {
    try {
      const profile = await fetchProfile(currentUser.id);
      setUser({
        email: currentUser.email ?? null,
        username: profile.username ?? null,
        profile_picture: profile.profile_picture ?? null,
        role: profile.role ?? null,
      });
    } catch {
      setUser({ email: currentUser.email ?? null });
    }
  } else {
    setUser(null);
  }
};

  useEffect(() => {
    loadUser();
    // Proper auth state listener using Supabase client
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <header
      className="w-full bg-gray-100 shadow-md py-3 relative flex justify-center items-center"
    >
      {/* Centered HobbyHive title */}
      <h1 className="title" style={{ fontSize: "2em", fontWeight: 700 }}>
        <span style={{ color: "#1DDACA" }}>Hobby</span>
        <span style={{ color: "#363636" }}>Hive</span>
      </h1>

      {/* Right side user info / buttons */}
      <div className="absolute right-4 flex items-center gap-4">
        {user ? (
          <>
            {user.profile_picture && (
              <img
                src={`${user.profile_picture}?t=${Date.now()}`}
                alt="Profile Picture"
                className="w-8 h-8 rounded-full object-cover"
              />
            )}
            <span className="text-gray-700 font-medium">
              {user.role === "user" ? (
                <Link href="/profile">
                  {user.username ?? user.email}
                </Link>
              ) : (
                <span>{user.username ?? user.email}</span>
              )}
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
            >
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={() => router.push("/login")}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Login
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;


/* ----------------previous version------------------
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import React from "react";
import { createClient } from "@/utils/supabase/client";
import { getCurrentUser, fetchProfile, logout } from "@/utils/supabase/account";

interface UserState {
  email: string | null;
  username?: string | null;
  profile_picture?: string | null;
}

const Header: React.FC = () => {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<UserState | null>(null);

  const loadUser = async () => {
    const currentUser = await getCurrentUser();
    if (currentUser) {
      try {
        const profile = await fetchProfile(currentUser.id);
        setUser({
          email: currentUser.email ?? null,
          username: profile.username ?? null,
          profile_picture: profile.profile_picture ?? null,
        });
      } catch {
        setUser({ email: currentUser.email ?? null });
      }
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    loadUser();

    // Proper auth state listener using Supabase client
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <header className="w-full flex justify-between items-center p-1 bg-gray-100 shadow-md">
      <h1 className="title" style={{ fontSize: "2em", fontWeight: 700 }}>
        <span style={{ color: "#1DDACA" }}>Hobby</span>
        <span style={{ color: "#363636" }}>Hive</span>
      </h1>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            {user.profile_picture && (
              <img
                src={`${user.profile_picture}?t=${Date.now()}`}
                alt="Profile Picture"
                className="w-8 h-8 rounded-full object-cover"
              />
            )}
            <span className="text-gray-700 font-medium">
              {user.username ?? user.email}
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
            >
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={() => router.push("/login")}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Login
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
*/
