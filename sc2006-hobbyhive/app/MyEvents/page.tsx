"use client";
import React, { useState } from "react";
import Header from "../components/header";
import Navbar from "../components/Navbar";
import Link from "next/link";      


const page: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"attending" | "hosting">("attending");
  const attendingEvents = [
    {
      title: "Badminton @ Bukit Panjang CC",
      date: "26 August 2026",
      time: "20:00",
      host: "Alan Wong",
      image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&h=600&fit=crop",
    },
  ];

  const hostingEvents = [
    {
      title: "Basketball @ OCBC Arena",
      date: "24 January 2026",
      time: "20:00",
      attendees: "6/8",
      image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&h=600&fit=crop",
    },
  ];
  
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#A8F0EB" }}>
      {/* Navbar */}
      <div className="absolute top-2 left-4 z-50">
        <Navbar />
      </div>
      {/* Header */}
      <Header />

      {/* Tabs */}
      <div className="flex justify-center mt-6">
        <div className="bg-gray-100 rounded-md shadow-md flex w-[600px] justify-around">
          <button
            onClick={() => setActiveTab("attending")}
            className={`flex-1 py-3 font-semibold hover:shadow-md transition-shadow ${
              activeTab === "attending"
                ? "border-b-4 border-black text-black"
                : "text-gray-600"
            }`}
          >
            Events Attending
          </button>
          <button
            onClick={() => setActiveTab("hosting")}
            className={`flex-1 py-3 font-semibold hover:shadow-md transition-shadow ${
              activeTab === "hosting"
                ? "border-b-4 border-black text-black"
                : "text-gray-600"
            }`}
          >
            Events Hosting
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex justify-center mt-6">
        <div className="bg-white shadow-md rounded-md p-4 w-[700px] flex items-center">
          <img
            src={
              activeTab === "attending"
                ? attendingEvents[0].image
                : hostingEvents[0].image
            }
            alt="Event"
            style={{
              width: "110px",
              height: "80px",
              borderRadius: "8px",
              objectFit: "cover",
              marginRight: "20px",
            }}
          />
          <div className="flex-1">
            <h2 className="font-semibold text-sm">
              {activeTab === "attending"
                ? attendingEvents[0].title
                : hostingEvents[0].title}
            </h2>
            <p>Date: {activeTab === "attending"
                ? attendingEvents[0].date
                : hostingEvents[0].date}</p>
            <p>Time: {activeTab === "attending"
                ? attendingEvents[0].time
                : hostingEvents[0].time}</p>
            {activeTab === "attending" ? (
              <p>
                Hosted By: {attendingEvents[0].host} |{" "}
                <Link href="/groupchat">
                  <button className="border border-teal-400 text-teal-500 px-4 py-1 rounded hover:bg-teal-100 transition-colors">
                    Group Chat
                  </button>
                </Link>
              </p>
            ) : (
              <p>
                Attendees: <b>{hostingEvents[0].attendees}</b> |{" "}
                <a href="#" className="text-teal-500 underline">        
                  Attendees List
                </a>
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            {activeTab === "attending" ? (
              <>
                <button className="bg-teal-400 text-white px-4 py-1 rounded hover:bg-teal-500 transition-colors">
                  View Details
                </button>
                <button className="border border-red-400 text-red-500 px-4 py-1 rounded hover:bg-red-200 transition-colors">
                  Drop Out
                </button>
              </>
            ) : (
              <>
                <button className="bg-teal-400 text-white px-4 py-1 rounded hover:bg-teal-500 transition-colors">
                  Edit Details
                </button>
                <Link href="/groupchat">
                  <button className="border border-teal-400 text-teal-500 px-4 py-1 rounded hover:bg-teal-100 transition-colors">
                    Group Chat
                  </button>
                </Link>
                <button className="border border-red-400 text-red-500 px-4 py-1 rounded hover:bg-red-100 transition-colors">
                  Cancel Event
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-4">
        <a
          href="#"
          className="text-teal-500 font-semibold underline"
        >
          {activeTab === "attending"
            ? "Find More Events Here!"
            : "Host More Events!"}
        </a>
      </div>
    </div>
  );
};

export default page;