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
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

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

          {error && <p style={{ color: "red", marginBottom: "12px" }}>{error}</p>}

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
              cursor: "pointer",
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p style={{ marginTop: "20px", fontSize: "0.9rem" }}>
          Don’t have an account?{" "}
          <Link href="/registration" style={{ color: "#1DDACA", textDecoration: "underline" }}>
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



/* ----------------------previous code before redesign --------------------- 
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
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    // ✅ Login success → go to homepage
    router.push("/");
  };

  return (
    <div className="login-container">
      <h1 className="title" style={{ fontSize: "3em", fontWeight: 700 }}>
        <span style={{ color: "#1DDACA" }}>Hobby</span>
        <span>Hive</span>
      </h1>
      <h2 className="title">
        <b>Account Log In</b>
      </h2>

      <form onSubmit={handleSubmit} autoComplete="off">
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="email">Email:</label>
          <br />
          <input
            className="input"
            type="email"
            id="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label htmlFor="password">Password:</label>
          <br />
          <input
            className="input"
            type="password"
            id="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>

        {error && <div style={{ color: "red", marginBottom: 12 }}>{error}</div>}

        <button type="submit" className="confirm-button" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <div style={{ textAlign: "center", marginTop: 12 }}>
        <Link href="/registration">Don&apos;t have an account? Register here</Link>
      </div>


    
      <Link href="/groupchat" className="p-20">temporary route to gc</Link>
    </div>
    
  );
}
  */

