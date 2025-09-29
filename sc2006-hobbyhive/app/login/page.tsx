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
    </div>
  );
}
