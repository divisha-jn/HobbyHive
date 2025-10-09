"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signup } from "@/utils/supabase/account";

export default function RegistrationPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password || !username || !confirmPassword) {
      setError("All fields except profile picture are required.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const { user } = await signup(
        email,
        password,
        username,
        profilePicture || undefined
      );

      if (!user) {
        setError("Signup failed. Please try again.");
        setLoading(false);
        return;
      }

      router.push("/");
    } catch (err: any) {
      setError(err.message || "Unexpected error during signup.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 text-[#363636]">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold mb-2 text-left">
          <span style={{ color: "#1DDACA" }}>Hobby</span>Hive
        </h1>
        <h2 className="text-xl font-semibold mb-6 text-left">
          Account Registration
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="label">
              <span className="label-text">Username</span>
            </label>
            <input
              type="text"
              id="username"
              placeholder="Your username"
              className="input w-full bg-white text-[#363636]"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="email" className="label">
              <span className="label-text">Email</span>
            </label>
            <input
              type="email"
              id="email"
              placeholder="you@example.com"
              className="input w-full bg-white text-[#363636]"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="password" className="label">
              <span className="label-text">Password</span>
            </label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              className="input w-full bg-white text-[#363636]"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="label">
              <span className="label-text">Confirm Password</span>
            </label>
            <input
              type="password"
              id="confirmPassword"
              placeholder="Confirm your password"
              className="input w-full bg-white text-[#363636]"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-red-500">{error}</p>}

          <button
            type="submit"
            className={`btn w-full text-white border-none bg-[#1DDACA] ${loading ? "loading" : ""}`}
            disabled={loading}
          >
            {loading ? "Signing up..." : "Register"}
          </button>
        </form>

        <p className="text-left mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-[#1DDACA] font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
