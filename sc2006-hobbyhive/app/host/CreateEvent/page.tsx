"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import Header from "../../components/header";
import Navbar from "../../components/Navbar";
import dynamic from "next/dynamic";
import { useSearchParams, useRouter } from "next/navigation";
import { getLocationConfigForCategory } from "@/app/config/categoryLocationMapping";

const LocationMapPicker = dynamic(
  () => import("../../components/LocationMapPicker"),
  { ssr: false }
);

interface EventData {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  capacity: string;
  category: string;
  skillLevel: string;
  image_url?: string;
}

export default function CreateEvent() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const router = useRouter();
  const eventId = searchParams.get("eventId");

  const [eventToEdit, setEventToEdit] = useState<EventData | null>(null);

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
  const [useMapPicker, setUseMapPicker] = useState(false);

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

  // Fetch event data if editing
  useEffect(() => {
    if (!eventId) return;

    const fetchEvent = async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();

      if (error) {
        console.error("Failed to fetch event:", error);
        return;
      }

      setEventToEdit({
        id: data.id,
        title: data.title,
        date: data.date,
        time: data.time,
        location: data.location,
        description: data.description,
        capacity: data.capacity.toString(),
        category: data.category,
        skillLevel: data.skill_level,
        image_url: data.image_url,
      });
    };

    fetchEvent();
  }, [eventId]);

  // Initialize form values from eventToEdit
  useEffect(() => {
    if (eventToEdit) {
      setTitle(eventToEdit.title);
      setDate(eventToEdit.date);
      setTime(eventToEdit.time);
      setLocation(eventToEdit.location);
      setDescription(eventToEdit.description);
      setCapacity(eventToEdit.capacity);
      setCategory(eventToEdit.category);
      setSkillLevel(eventToEdit.skillLevel);
    }
  }, [eventToEdit]);

  const handleLocationSelect = (locationName: string) => {
    setLocation(locationName);
    setErrors((prev) => ({ ...prev, location: false }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setMessage("Please log in first.");
      setIsLoading(false);
      return;
    }
    const userId = user.id;

    // Validation
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
      // Upload image if new file selected
      let imageUrl =
        eventToEdit?.image_url ||
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e";
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const uniqueName = `${title.replace(/\s+/g, "_")}_${Date.now()}.${fileExt}`;
        const filePath = `${userId}/${uniqueName}`;
        const { error: uploadError } = await supabase.storage
          .from("event-photo")
          .upload(filePath, imageFile);
        if (uploadError) {
          setMessage("Error uploading image: " + uploadError.message);
          setIsLoading(false);
          return;
        }
        const { data: publicUrlData } = supabase.storage
          .from("event-photo")
          .getPublicUrl(filePath);
        imageUrl = publicUrlData.publicUrl;
      }

      if (eventToEdit) {
        // Update existing event
        const { error } = await supabase
          .from("events")
          .update({
            title,
            date,
            time,
            location,
            description,
            capacity: parseInt(capacity),
            category,
            skill_level: skillLevel,
            image_url: imageUrl,
          })
          .eq("id", eventToEdit.id);

        if (error) {
          setMessage("Error updating event: " + error.message);
        } else {
          setSuccess(true);
          setMessage("Event updated successfully!");
        }
      } else {
        // Create new event
        const { error } = await supabase.from("events").insert([
          {
            title,
            date,
            time,
            location,
            description,
            capacity: parseInt(capacity),
            category,
            skill_level: skillLevel,
            image_url: imageUrl,
            host_id: userId,
          },
        ]);

        if (error) {
          setMessage("Error creating event: " + error.message);
        } else {
          setSuccess(true);
          setMessage("Event created successfully!");
        }
      }
    } catch (err) {
      console.error(err);
      setMessage("Unexpected error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getInputClassName = (fieldName: string) => {
    const baseClass =
      "w-full border p-3 rounded focus:outline-none focus:ring-2";
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
                {eventToEdit ? "Event Updated!" : "Event Created!"}
              </h2>
              <p className="mb-6 text-gray-700">
                Your event <strong>{title}</strong> was{" "}
                {eventToEdit ? "updated" : "created"} successfully.
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
                  setUseMapPicker(false);
                  setEventToEdit(null);
                  router.push("/host/CreateEvent");
                }}
                className="inline-block bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition"
              >
                {eventToEdit ? "Update Another Event" : "Create Another Event"}
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-3xl font-bold mb-8 text-gray-800">
                {eventToEdit ? "Update Event Details" : "Create New Event"}
              </h2>

              {message && (
                <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  <p className="font-semibold">⚠ {message}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6 text-left">
                {/* TITLE */}
                <div>
                  <label className="block mb-2 font-semibold">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={getInputClassName("title")}
                    placeholder="e.g., Weekend Hike"
                  />
                </div>

                {/* CATEGORY & SKILL LEVEL */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 font-semibold">
                      Event Category *
                    </label>
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
                    <label className="block mb-2 font-semibold">
                      Skill Level *
                    </label>
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

                {/* DATE & TIME */}
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

                {/* LOCATION WITH CATEGORY-BASED MAP PICKER */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block font-semibold">Location *</label>
                    {category &&
                      getLocationConfigForCategory(category).showMapPicker && (
                        <button
                          type="button"
                          onClick={() => setUseMapPicker(!useMapPicker)}
                          className="text-sm bg-teal-100 text-teal-700 px-3 py-1 rounded hover:bg-teal-200 transition"
                        >
                          {useMapPicker
                            ? "📝 Switch to Manual Entry"
                            : "🗺️ Use Map Picker"}
                        </button>
                      )}
                  </div>

                  {!category && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded mb-3 text-sm text-yellow-800">
                      ⚠️ Please select an event category first to see location
                      options
                    </div>
                  )}

                  {category &&
                    !getLocationConfigForCategory(category).showMapPicker && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded mb-3 text-sm text-blue-800">
                        ℹ️ For "{category}" events, please enter your location
                        manually
                      </div>
                    )}

                  {useMapPicker &&
                  category &&
                  getLocationConfigForCategory(category).showMapPicker ? (
                    <>
                      <LocationMapPicker
                        onLocationSelect={handleLocationSelect}
                        selectedLocation={location}
                        eventCategory={category}
                      />
                      {location && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                          <p className="text-sm text-green-800">
                            <strong>Selected:</strong> {location}
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className={getInputClassName("location")}
                      placeholder="e.g., Ang Mo Kio Community Club"
                      disabled={!category}
                    />
                  )}
                </div>

                {/* DESCRIPTION */}
                <div>
                  <label className="block mb-2 font-semibold">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Describe your event..."
                    rows={4}
                  />
                </div>

                {/* CAPACITY & IMAGE */}
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
                      onChange={(e) =>
                        setImageFile(e.target.files?.[0] || null)
                      }
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
                  {isLoading
                    ? eventToEdit
                      ? "Updating Event..."
                      : "Creating Event..."
                    : eventToEdit
                      ? "Update Event"
                      : "Create Event"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
