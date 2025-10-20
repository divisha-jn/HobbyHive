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
  const [category, setCategory] = useState("");
  const [skillLevel, setSkillLevel] = useState("");
  const [image, setImage] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false); //  Track success
  const [errors, setErrors] = useState<{[key: string]: boolean}>({});

  const categories = [
    "Sports & Fitness",
    "Arts & Crafts",
    "Music",
    "Gaming",
    "Cooking & Baking",
    "Outdoor Activities",
    "Photography",
    "Dance",
    "Reading & Books",
    "Language Learning",
    "Other"
  ];

  const skillLevels = [
    "Beginner friendly",
    "Intermediate",
    "Advanced",
    "All levels welcome"
  ];
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    const newErrors: {[key: string]: boolean} = {};
    if (!title) newErrors.title = true;
    if (!category) newErrors.category = true;
    if (!skillLevel) newErrors.skillLevel = true;
    if (!date) newErrors.date = true;
    if (!time) newErrors.time = true;
    if (!location) newErrors.location = true;
    if (!maxParticipants) newErrors.maxParticipants = true;

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      setMessage("Please fill in all required fields marked with *");
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
        category,
        skillLevel
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
  const getInputClassName = (fieldName: string) => {
    const baseClass = "w-full border p-3 rounded focus:outline-none focus:ring-2";
    if (errors[fieldName]) {
      return `${baseClass} border-red-500 focus:ring-red-500`;
    }
    return `${baseClass} border-gray-300 focus:ring-teal-500`;
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
                className="inline-block bg-teal-500 text-white px-6 py-3 rounded-lg hover:bg-teal-600 transition mr-4"
              >
                Go to My Events
              </a>
              <button
                onClick={() => {
                    setSuccess(false);
                    setTitle("");
                    setDate("");
                    setTime("");
                    setLocation("");
                    setDescription("");
                    setMaxParticipants("");
                    setImage("");
                    setCategory("");
                    setSkillLevel("");
                    setErrors({});
                    setMessage("");
                }}
                className="inline-block bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition"
              >
                Create New Event
              </button>                   
            </div>
          
          ) : (
            <>
              <h2 className="text-3xl font-bold mb-8 text-gray-800">
                Create New Event
              </h2>

              {/* Error Message */}
              {message && !message.includes("success") && (
                <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  <p className="font-semibold">⚠ {message}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6 text-left">

                {/* Title */}
                <div>
                  <label className="block mb-2 font-semibold">Event Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (errors.title) setErrors({...errors, title: false});
                    }}
                    className={getInputClassName('title')}
                    placeholder="e.g., Weekend Hike"
                    
                  />
                </div>
                {/* Category and Skill Level */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 font-semibold text-gray-700">Event Category *</label>
                    <select
                      value={category}
                      onChange={(e) => {
                        setCategory(e.target.value);
                        if (errors.category) setErrors({...errors, category: false});
                      }}
                      className={getInputClassName('category')}
                      
                    >
                      <option value="">Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-2 font-semibold text-gray-700">Skill Level *</label>
                    <select
                      value={skillLevel}
                      onChange={(e) => {
                        setSkillLevel(e.target.value);
                        if (errors.skillLevel) setErrors({...errors, skillLevel: false});
                      }}
                      className={getInputClassName('skillLevel')}
                      
                    >
                      <option value="">Select skill level</option>
                      {skillLevels.map((level) => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 font-semibold">Date *</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => {
                        setDate(e.target.value);
                        if (errors.date) setErrors({...errors, date: false});
                      }}
                      className={getInputClassName('date')}
                      
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-semibold">Time *</label>
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => {
                        setTime(e.target.value);
                        if (errors.time) setErrors({...errors, time: false});
                      }}
                      className={getInputClassName('time')}
                      
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block mb-2 font-semibold">Location *</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => {
                      setLocation(e.target.value);
                      if (errors.location) setErrors({...errors, location: false});
                    }}
                    className={getInputClassName('location')}
                    placeholder="e.g., Ang Mo Kio Community Club"
                    
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block mb-2 font-semibold">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Describe your event, what participants can expect or bring, etc."
                    rows={4}
                  />
                </div>

                {/* Max Participants and Image */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 font-semibold">Max Participants *</label>
                    <input
                      type="number"
                      value={maxParticipants}
                      onChange={(e) => {
                        setMaxParticipants(e.target.value);
                        if (errors.maxParticipants) setErrors({...errors, maxParticipants: false});
                      }}
                      className={getInputClassName('maxParticipants')}
                      min={1}
                      placeholder="e.g. 10"
                      
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-semibold">Image URL (optional)</label>
                    <input
                      type="url"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="https://example.com/image.jpg"
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

