"use client";
import React, { useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Both fields are required.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    
    // Step 1: Attempt login
    const { data, error: loginError } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });

    if (loginError) {
      setLoading(false);
      setError(loginError.message);
      return;
    }

    // Step 2: Check if user is banned
    console.log("[Login] Checking ban status for user:", data.user.id);
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_banned, ban_reason, banned_until")
      .eq("id", data.user.id)
      .single();

    if (profileError) {
      console.error("[Login] Profile fetch error:", profileError);
      setLoading(false);
      setError("Failed to load profile. Please try again.");
      return;
    }

    console.log("[Login] User ban status:", profile);

    // Step 3: Handle ban status
    if (profile.is_banned) {
      // Check if it's a temporary ban that has expired
      if (profile.banned_until) {
        const banExpiry = new Date(profile.banned_until);
        const now = new Date();
        
        console.log("[Login] Ban expiry:", banExpiry, "Current time:", now);
        
        if (now < banExpiry) {
          // Still banned - deny access
          console.log("[Login] User is still banned, logging out");
          await supabase.auth.signOut();
          setLoading(false);
          const daysLeft = Math.ceil((banExpiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          setError(
            `Your account is banned for ${daysLeft} more day${daysLeft !== 1 ? 's' : ''}. Reason: ${profile.ban_reason || "No reason provided"}`
          );
          return;
        } else {
          // Ban expired - automatically unban the user
          console.log("[Login] Ban expired, automatically unbanning user");
          await supabase
            .from("profiles")
            .update({ 
              is_banned: false, 
              ban_reason: null, 
              banned_until: null 
            })
            .eq("id", data.user.id);
          
          // Allow login to proceed
        }
      } else {
        // Permanent ban - deny access
        console.log("[Login] User is permanently banned, logging out");
        await supabase.auth.signOut();
        setLoading(false);
        setError(
          `Your account is permanently banned. Reason: ${profile.ban_reason || "No reason provided"}. Contact support if you believe this is a mistake.`
        );
        return;
      }
    }

    // Step 4: If not banned (or ban expired), proceed to homepage
    console.log("[Login] User is not banned, proceeding to homepage");
    setLoading(false);
    router.push("/");
  };

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        backgroundColor: "#f0f0f0",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      {/* Login Card */}
      <div
        style={{
          backgroundColor: "white",
          padding: "40px",
          borderRadius: "12px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          width: "100%",
          maxWidth: "400px",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "2.5rem", fontWeight: "800", marginBottom: "8px" }}>
          <span style={{ color: "#1DDACA" }}>Hobby</span>Hive
        </h1>
        <h2 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "32px" }}>
          Account Login
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px", textAlign: "left" }}>
            <label htmlFor="email" style={{ display: "block", marginBottom: "6px" }}>
              Email:
            </label>
            <input
              type="email"
              id="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "6px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: "20px", textAlign: "left" }}>
            <label htmlFor="password" style={{ display: "block", marginBottom: "6px" }}>
              Password:
            </label>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "6px",
                boxSizing: "border-box",
              }}
            />
          </div>

          {error && (
            <div 
              style={{ 
                color: "red", 
                marginBottom: "12px", 
                fontSize: "0.9rem",
                textAlign: "left",
                padding: "10px",
                backgroundColor: "#fee",
                borderRadius: "6px",
                border: "1px solid #fcc"
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              backgroundColor: "#1DDACA",
              color: "white",
              padding: "10px",
              fontWeight: "600",
              border: "none",
              borderRadius: "6px",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p style={{ marginTop: "20px", fontSize: "0.9rem" }}>
          Don't have an account?{" "}
          <Link href="/register" style={{ color: "#1DDACA", textDecoration: "underline" }}>
            Register Here!
          </Link>
        </p>
      </div>

      {/* Temporary link at the bottom */}
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          width: "100%",
          textAlign: "center",
        }}
      >
        <Link href="/groupchat" style={{ color: "#1DDACA", textDecoration: "underline" }}>
          click me for temporary route to gc
        </Link>
      </div>
    </div>
  );
}
