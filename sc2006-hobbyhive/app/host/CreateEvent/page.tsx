"use client";

import React, { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Header from "../../components/header";
import Navbar from "../../components/Navbar";

export default function CreateEvent() {
  const supabase = createClient();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [capacity, setCapacity] = useState("");
  const [category, setCategory] = useState("");
  const [skillLevel, setSkillLevel] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});

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
    "Other",
  ];

  const skillLevels = [
    "Beginner friendly",
    "Intermediate",
    "Advanced",
    "All levels welcome",
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault(); // ✅ move this up immediately

  setIsLoading(true);
  setMessage("");

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user) {
    setMessage("Please log in before creating an event.");
    setIsLoading(false);
    return;
  }

  // Validate required fields
  const newErrors: { [key: string]: boolean } = {};
  if (!title) newErrors.title = true;
  if (!category) newErrors.category = true;
  if (!skillLevel) newErrors.skillLevel = true;
  if (!date) newErrors.date = true;
  if (!time) newErrors.time = true;
  if (!location) newErrors.location = true;
  if (!capacity) newErrors.capacity = true;

  setErrors(newErrors);
  if (Object.keys(newErrors).length > 0) {
    setMessage("Please fill in all required fields marked with *");
    setIsLoading(false);
    return;
  }

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        setMessage("Please log in before creating an event.");
        setIsLoading(false);
        return;
      }
      const userId = userData.user.id;

      let imageUrl = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e"; 
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const uniqueName = `${title.replace(/\s+/g, "_")}_${Date.now()}.${fileExt}`;
        const filePath = `${userId}/${uniqueName}`;

        const { error: uploadError } = await supabase.storage
          .from("event-photo")
          .upload(filePath, imageFile);

        if (uploadError) {
          console.error("Upload error:", uploadError.message);
          setMessage("Error uploading image: " + uploadError.message);
          setIsLoading(false);
          return;
        }

        // ✅ Get public URL
        const { data: publicUrlData } = supabase.storage
          .from("event-photo")
          .getPublicUrl(filePath);
        imageUrl = publicUrlData.publicUrl;
      }

      const { error } = await supabase.from("events").insert([
        {
          title,
          date,
          time,
          location,
          description,
          capacity: parseInt(capacity),
          image_url: imageUrl,
          category,
          skill_level: skillLevel,
          host_id: userId,
        },
      ]);

      if (error) {
        console.error("Insert error:", error.message);
        setMessage("Error creating event: " + error.message);
      } else {
        setSuccess(true);
        setMessage("Event created successfully!");
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setMessage("Unexpected error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getInputClassName = (fieldName: string) => {
    const baseClass = "w-full border p-3 rounded focus:outline-none focus:ring-2";
    return errors[fieldName]
      ? `${baseClass} border-red-500 focus:ring-red-500`
      : `${baseClass} border-gray-300 focus:ring-teal-500`;
  };

  return (
    <div className="bg-gradient-to-r from-teal-400 to-cyan-500 min-h-screen">
      <div className="absolute top-2 left-4 z-50">
        <Navbar />
      </div>
      <Header />

      <div className="flex justify-center mt-10 px-4">
        <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-2xl text-center">
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
                  setCapacity("");
                  setCategory("");
                  setSkillLevel("");
                  setErrors({});
                  setMessage("");
                  setImageFile(null);
                }}
                className="inline-block bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition"
              >
                Create Another Event
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-3xl font-bold mb-8 text-gray-800">
                Create New Event
              </h2>

              {message && (
                <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  <p className="font-semibold">⚠ {message}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6 text-left">
                <div>
                  <label className="block mb-2 font-semibold">Event Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={getInputClassName("title")}
                    placeholder="e.g., Weekend Hike"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 font-semibold">Event Category *</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className={getInputClassName("category")}
                    >
                      <option value="">Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-2 font-semibold">Skill Level *</label>
                    <select
                      value={skillLevel}
                      onChange={(e) => setSkillLevel(e.target.value)}
                      className={getInputClassName("skillLevel")}
                    >
                      <option value="">Select skill level</option>
                      {skillLevels.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 font-semibold">Date *</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className={getInputClassName("date")}
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-semibold">Time *</label>
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className={getInputClassName("time")}
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-2 font-semibold">Location *</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className={getInputClassName("location")}
                    placeholder="e.g., Ang Mo Kio Community Club"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-semibold">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Describe your event..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 font-semibold">
                      Max Participants *
                    </label>
                    <input
                      type="number"
                      value={capacity}
                      onChange={(e) => setCapacity(e.target.value)}
                      className={getInputClassName("capacity")}
                      min={1}
                      placeholder="e.g. 10"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 font-semibold">
                      Upload Image (optional)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                      className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 rounded text-white font-semibold ${
                    isLoading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-teal-500 hover:bg-teal-600"
                  }`}
                >
                  {isLoading ? "Creating Event..." : "Create Event"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
