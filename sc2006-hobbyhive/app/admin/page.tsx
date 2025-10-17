"use client";

import React from "react";
import Link from "next/link";
import Header from "../components/header";
import Navbar from "../components/Navbar";
import AuthWrapper from "../components/AuthWrapper";

const AdminDashboard: React.FC = () => {
  return (
    <AuthWrapper allowedRoles={["admin"]}>
    <div className="min-h-screen" style={{ backgroundColor: "#A8F0EB" }}>
      {/* Navbar */}
      <div className="absolute top-2 left-4 z-50">
        <Navbar />
      </div>

      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-gray-800 text-center">
          Admin Control Panel
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Review Users Card */}
          <Link href="/admin/review-users">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow cursor-pointer border-l-4 border-blue-500">
              <div className="flex items-center mb-4">
                <svg
                  className="w-8 h-8 text-blue-500 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                <h2 className="text-xl font-semibold text-gray-800">Review Users</h2>
              </div>
              <p className="text-gray-600">View flagged users and manage user accounts</p>
            </div>
          </Link>

          {/* Review Events Card */}
          <Link href="/admin/review-events">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow cursor-pointer border-l-4 border-green-500">
              <div className="flex items-center mb-4">
                <svg
                  className="w-8 h-8 text-green-500 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <h2 className="text-xl font-semibold text-gray-800">Review Events</h2>
              </div>
              <p className="text-gray-600">Approve or reject pending event requests</p>
            </div>
          </Link>

          {/* Moderate Events Card */}
          <Link href="/admin/moderate-events">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow cursor-pointer border-l-4 border-red-500">
              <div className="flex items-center mb-4">
                <svg
                  className="w-8 h-8 text-red-500 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <h2 className="text-xl font-semibold text-gray-800">Moderate Events</h2>
              </div>
              <p className="text-gray-600">Review and handle flagged events</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
    </AuthWrapper>
  );
};

export default AdminDashboard;
