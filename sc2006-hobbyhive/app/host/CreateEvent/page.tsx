"use client";

import React, { useState } from "react";
import Header from "../../components/header";
import Navbar from "../../components/Navbar";

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
  const [success, setSuccess] = useState(false); //  Track success

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
      // Simulate API call
      console.log("Creating event:", {
        title,
        date,
        time,
        location,
        description,
        maxParticipants: parseInt(maxParticipants),
        image: image || "(default)",
      });

      await new Promise(resolve => setTimeout(resolve, 1000));

      // Set success
      setSuccess(true);
      setMessage("Event created successfully!");
    } catch (error) {
      setMessage("Error creating event. Please try again.");
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-teal-400 to-cyan-500">
      <div className="absolute top-2 left-4 z-50">
        <Navbar />
      </div>

      <Header />

      <div className="flex justify-center mt-10 px-4">
        <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-2xl text-center">
          {/*  Show success message instead of form */}
          {success ? (
            <div>
              <h2 className="text-3xl font-bold text-teal-600 mb-4">
                 Event Created!
              </h2>
              <p className="mb-6 text-gray-700">
                Your event <strong>{title}</strong> was successfully created.
              </p>
              <a
                href="/MyEvents"
                className="inline-block bg-teal-500 text-white px-6 py-3 rounded-lg hover:bg-teal-600 transition"
              >
                Go to My Events
              </a>
            </div>
          ) : (
            <>
              <h2 className="text-3xl font-bold mb-8 text-gray-800">
                Create New Event
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6 text-left">
                {/* Input fields... */}
                {/* [same form inputs you already have] */}

                {/* Title */}
                <div>
                  <label className="block mb-2 font-semibold">Event Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border p-3 rounded"
                    required
                  />
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 font-semibold">Date *</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full border p-3 rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-semibold">Time *</label>
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full border p-3 rounded"
                      required
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block mb-2 font-semibold">Location *</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full border p-3 rounded"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block mb-2 font-semibold">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full border p-3 rounded"
                    rows={3}
                  />
                </div>

                {/* Max Participants and Image */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 font-semibold">Max Participants *</label>
                    <input
                      type="number"
                      value={maxParticipants}
                      onChange={(e) => setMaxParticipants(e.target.value)}
                      className="w-full border p-3 rounded"
                      min={1}
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-semibold">Image URL (optional)</label>
                    <input
                      type="url"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      className="w-full border p-3 rounded"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 rounded text-white font-semibold ${
                    isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-teal-500 hover:bg-teal-600"
                  }`}
                >
                  {isLoading ? "Creating Event..." : "Create Event"}
                </button>

                {/* Message */}
                {message && (
                  <div className={`mt-4 text-center font-medium ${
                    message.includes("success") ? "text-green-600" : "text-red-600"
                  }`}>
                    {message}
                  </div>
                )}
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

