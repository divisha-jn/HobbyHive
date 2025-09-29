// components/Header.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client"; // adjust path if needed
import React from "react";

const Header: React.FC = () => {
    const router = useRouter();
    const [user, setUser] = useState<{ email: string | null } | null>(null);


    // Fetch current user on mount
    const supabase = createClient();
    useEffect(() => {
    // Get current session
    supabase.auth.getSession().then(({ data }) => {
        if (data.session?.user) {
        setUser({ email: data.session.user.email ?? "No email" });
        }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
        setUser({ email: session.user.email ?? "No email" });
        } else {
        setUser(null);
        }
    });

    // Cleanup
    return () => {
        subscription.unsubscribe();
    };
    }, []);



    const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout error:", error.message);
    } else {
      router.push("/login");
    }
  };

  return (
    <header className="w-full flex justify-between items-center p-1 bg-gray-100 shadow-md">
      <h1 className="title" style={{ fontSize: "2em", fontWeight: 700 }}>
        <span style={{ color: "#1DDACA" }}>Hobby</span>
        <span>Hive</span>
      </h1>
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span className="text-gray-700">{user.email}</span>
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