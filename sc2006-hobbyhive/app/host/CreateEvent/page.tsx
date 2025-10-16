"use client";

import React, { useState } from "react";
import Header from "../../../components/Header";
import Navbar from "../../../components/Navbar";
import { useRouter } from "next/navigation";

export default function CreateEvent() {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("");
  const [image, setImage] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    if (!title || !date || !time || !location || !maxParticipants) {
      setMessage("Please fill in all required fields.");
      setIsLoading(false);
      return;
    }

    try {
      // Simulate API call - replace with your actual backend integration
      console.log("Creating event:", {
        title,
        date,
        time,
        location,
        description,
        maxParticipants: parseInt(maxParticipants),
        image: image || "(default)",
      });

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      setMessage("Event created successfully!");
      
      // Redirect to my-events page after successful creation
      setTimeout(() => {
        router.push("/MyEvents");

      }, 1500);

    } catch (error) {
      setMessage("Error creating event. Please try again.");
      console.error("Error creating event:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#A8F0EB] relative">
      {/* Navbar */}
      <div className="absolute top-2 left-4 z-50">
        <Navbar />
      </div>

      {/* Header */}
      <Header />

      {/* Form container */}
      <div className="flex justify-center mt-10 px-4">
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-lg rounded-xl p-8 w-full max-w-2xl"
        >
          <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
            Create New Event
          </h2>

          <div className="space-y-6">
            {/* Event Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Event Title *
              </label>
              <input
                type="text"
                placeholder="Enter event title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
                required
              />
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Time *
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Location *
              </label>
              <input
                type="text"
                placeholder="Enter event location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                placeholder="Describe your event (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent resize-none"
              />
            </div>

            {/* Max Participants and Image URL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Max Participants *
                </label>
                <input
                  type="number"
                  placeholder="e.g., 10"
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(e.target.value)}
                  min="1"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Image URL (optional)
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-teal-400 hover:bg-teal-500 transform hover:scale-105"
              } text-white shadow-md`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Event...
                </span>
              ) : (
                "Create Event"
              )}
            </button>

            {/* Message Display */}
            {message && (
              <div className={`text-center p-4 rounded-lg font-semibold ${
                message.includes("successfully") 
                  ? "bg-green-100 text-green-700 border border-green-200" 
                  : "bg-red-100 text-red-700 border border-red-200"
              }`}>
                {message}
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
