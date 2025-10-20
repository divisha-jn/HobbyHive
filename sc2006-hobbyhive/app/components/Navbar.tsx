'use client'
import Link from "next/link";
import React, { useEffect, useState } from 'react'
import { createClient } from "@/utils/supabase/client";

const Navbar = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role === "admin") {
        setIsAdmin(true);
      }
      
      setLoading(false);
    };

    checkAdminStatus();
  }, []);

  return (
    <div className="navbar">
        <div className="flex-1">
            <details className="dropdown">
                <summary className="btn m-1 rounded-xl border-1 border-teal-500">☰</summary>
                    <ul className="menu dropdown-content bg-base-100 rounded-box z-2 w-52 p-2 shadow-sm">
                        <li><Link href="/profile">👤 Profile</Link></li>
                        <li><Link href="/events">📅 Events</Link></li>
                        <li><Link href="/groupchat">💬 Groupchats</Link></li>
                        
                        {/* Only show Admin Controls if user is admin */}
                        {!loading && isAdmin && (
                          <li><Link href="/admin">⚙️ Admin Controls</Link></li>
                        )}
                    </ul>
            </details>
        </div>
    </div>
  );
};

export default Navbar;
