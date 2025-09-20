"use client";
import React, { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    // Test user credentials
    const TEST_USER = {
        email: "test@example.com",
        password: "password123",
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!email || !password) {
            setError("Both fields are required.");
            return;
        }

        // Local test user check
        if (email === TEST_USER.email && password === TEST_USER.password) {
            alert("Login successful!");
        } else {
            setError("Invalid email or password.");
        }
    };

    return (
        <div className="login-container">
            <h1 className="title" style={{ fontSize: "3em", fontWeight: 700 }}>
                <span style={{ color: "#1DDACA" }}>Hobby</span>
                <span>Hive</span>
            </h1>
            <h2 className="title"><b>Account Log In</b></h2>
            <form onSubmit={handleSubmit} autoComplete="off" style={{minHeight: "max-content"}}>
                <div style={{ marginBottom: 16 }}>
                    <label htmlFor="email">Email / Username:</label>
                    <br />
                    <input
                        className="input"
                        type="email"
                        id="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
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
                        onChange={e => setPassword(e.target.value)}
                        autoComplete="current-password"
                    />
                </div>
                {error && <div style={{ color: "red", marginBottom: 12 }}>{error}</div>}
                <button type="submit" className="confirm-button">Login</button>
            </form>
            <div style={{ textAlign: "center" }}>
                <Link href="/registration">
                    Don't have an account? Register here
                </Link>
            </div>
        </div>
    );
}
