"use client";

import React, { useState } from "react";
import Header from "../components/Header"; // make sure this is also a client component
import Navbar from "../components/Navbar"; // make sure this is also a client component

const CreateEvent: React.FC = () => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [image, setImage] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Submit clicked"); // debugging

    if (!title || !date || !time || !location) {
      setMessage("Please fill in all required fields.");
      return;
    }

    setMessage("Event created successfully!");
    console.log({
      title,
      date,
      time,
      location,
      image: image || "(default)",
    });

    // Clear form
    setTitle("");
    setDate("");
    setTime("");
    setLocation("");
    setImage("");
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
      <div className="flex justify-center mt-10">
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded-md p-6 w-[700px]"
        >
          <h2 className="text-2xl font-bold mb-4 text-center">
            Create New Event
          </h2>

          <div className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Event Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border border-gray-300 rounded p-2"
              required
            />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border border-gray-300 rounded p-2"
              required
            />
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="border border-gray-300 rounded p-2"
              required
            />
            <input
              type="text"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="border border-gray-300 rounded p-2"
              required
            />
            <input
              type="text"
              placeholder="Image URL (optional)"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="border border-gray-300 rounded p-2"
            />

            <button
              type="submit"
              className="bg-teal-400 text-white px-4 py-2 rounded hover:bg-teal-500 transition-colors"
            >
              Create Event
            </button>

            {message && (
              <p className="text-center mt-2 font-semibold text-gray-700">
                {message}
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;

