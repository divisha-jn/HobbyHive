"use client";
import React, { useState } from "react";
import Header from "../components/header";
import Navbar from "../components/Navbar";
import Link from "next/link";


interface Attendee {
  id: number;
  name: string;
  profilePic: string;
}

const Page: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"attending" | "hosting">("attending");
  const [showAttendeeModal, setShowAttendeeModal] = useState(false);


  const attendees: Attendee[] = [
    { id: 1, name: "Me", profilePic: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" },
    { id: 2, name: "Sarah Chen", profilePic: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face" },
    { id: 3, name: "Mike Johnson", profilePic: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face" },
    { id: 4, name: "Emily Davis", profilePic: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face" },
    { id: 5, name: "David Kim", profilePic: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face" },
    { id: 6, name: "Lisa Wang", profilePic: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face" },
  ];

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
    <div className="min-h-screen bg-gradient-to-r from-teal-400 to-cyan-500">
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
            <h2 className="font-semibold text-lg">
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
                <button 
                  onClick={() => setShowAttendeeModal(true)}
                  className="text-teal-500 underline hover:text-teal-600 transition-colors"
                >        
                  Attendee List
                </button>
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

      {/* Attendee List Modal */}
      {showAttendeeModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-teal-400 to-cyan-500 p-4 text-white">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Attendee List</h2>
                <button
                  onClick={() => setShowAttendeeModal(false)}
                  className="text-white hover:text-gray-200 text-2xl font-bold transition-colors"
                >
                  ×
                </button>
              </div>
              <p className="text-teal-100 text-sm mt-1">
                {hostingEvents[0].title}
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-4 max-h-96 overflow-y-auto">
              <div className="space-y-3">
                {attendees.map((attendee) => (
                  <div
                    key={attendee.id}
                    className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <img
                      src={attendee.profilePic}
                      alt={attendee.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-teal-200"
                    />
                    <span className="font-medium text-gray-800">
                      {attendee.name}
                    </span>
                    {attendee.name === "Me" && (
                      <span className="ml-auto bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded-full font-medium">
                        Host
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-4 pt-1 pb-3 border-t border-gray-200">
              <div className="flex justify-between text-md text-gray-600">
                <span>Total attendees: {attendees.length}</span>
                <span>Capacity: 8</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-center mt-4">
        {activeTab === "attending" ? (
          <Link
            href="/events" 
            className="text-black-500 font-semibold underline"
          >
            Find More Events Here!
          </Link>
        ) : (
          <Link
            href="/host/CreateEvent" 
            className="text-black-500 font-semibold underline"
          >
            Host More Events!
          </Link>
        )}
      </div>
    </div>
  );
};

export default Page;