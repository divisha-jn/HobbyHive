"use client";
import React, { useState, useEffect, Suspense } from "react";
import Header from "@/app/components/header";
import Navbar from "@/app/components/Navbar";
import { useSearchParams, useRouter } from "next/navigation";
import { EventController } from "@/app/host/controllers/EventController";
import { EventModel } from "@/app/host/models/EventModel";
import LocationSection from "@/app/host/components/LocationSection";

function CreateEventContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const eventId = searchParams.get("eventId");

  // Initialize MVC
  const eventModel = new EventModel();
  const eventController = new EventController(eventModel);

  // Form state
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [nearestMRT, setNearestMRT] = useState<string | null>(null);
  const [nearestMRTDistance, setNearestMRTDistance] = useState<number | null>(null);
  const [description, setDescription] = useState("");
  const [capacity, setCapacity] = useState("");
  const [category, setCategory] = useState("");
  const [skillLevel, setSkillLevel] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [useMapPicker, setUseMapPicker] = useState(false);

  // UI state
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});
  const [eventToEdit, setEventToEdit] = useState<any>(null);

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

  // Fetch event if editing
  useEffect(() => {
    if (!eventId) return;

    const fetchEvent = async () => {
      const { data, error } = await eventController.fetchEventById(eventId);

      if (error) {
        console.error("Failed to fetch event:", error);
        return;
      }

      if (data) {
        setEventToEdit(data);
        setTitle(data.title);
        setDate(data.date);
        setTime(data.time);
        setLocation(data.location);
        setDescription(data.description || "");
        setCapacity(data.capacity.toString());
        setCategory(data.category);
        setSkillLevel(data.skill_level);
        if (data.latitude) setLatitude(data.latitude);
        if (data.longitude) setLongitude(data.longitude);
        if (data.nearest_mrt_station) setNearestMRT(data.nearest_mrt_station);
        if (data.nearest_mrt_distance) setNearestMRTDistance(data.nearest_mrt_distance);
      }
    };

    fetchEvent();
  }, [eventId]);

  // Handle location selection with MRT calculation
  // Add this after the handleLocationSelect function definition
const handleLocationSelect = async (locationName: string, lat?: number, lng?: number) => {
  console.log('🔍 handleLocationSelect called:', { locationName, lat, lng }); // ADD THIS
  
  setLocation(locationName);
  setErrors((prev) => ({ ...prev, location: false }));

  if (lat !== undefined && lng !== undefined) {
    setLatitude(lat);
    setLongitude(lng);
    
    console.log('🚇 Calculating MRT for:', lat, lng); // ADD THIS

    const mrtInfo = await eventController.calculateNearestMRT(lat, lng);
    console.log('🚇 MRT Info received:', mrtInfo); // ADD THIS
    
    if (mrtInfo) {
      setNearestMRT(mrtInfo.name);
      setNearestMRTDistance(mrtInfo.distance);
      console.log('✅ MRT State set:', mrtInfo.name, mrtInfo.distance); // ADD THIS
    } else {
      console.log('❌ No MRT info returned'); // ADD THIS
    }
  } else {
    console.log('⚠️ Coordinates are undefined'); // ADD THIS
  }
};

// Also add this useEffect to monitor state changes
useEffect(() => {
  console.log('📊 MRT State changed:', { nearestMRT, nearestMRTDistance });
}, [nearestMRT, nearestMRTDistance]);


  

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    const formData = {
      title,
      category,
      skillLevel,
      date,
      time,
      location,
      capacity,
      description,
      latitude,
      longitude,
      nearestMRT,
      nearestMRTDistance,
    };

    let result;
    if (eventToEdit) {
      result = await eventController.updateEvent(
        eventToEdit.id,
        formData,
        imageFile,
        eventToEdit.image_url
      );
    } else {
      result = await eventController.createEvent(formData, imageFile);
    }

    if (result.success) {
      setSuccess(true);
      setMessage(result.message || "");
    } else {
      setErrors(result.errors);
      setMessage(result.message || "");
    }

    setIsLoading(false);
  };

  // Handle reset form
  const handleReset = () => {
    setSuccess(false);
    setTitle("");
    setDate("");
    setTime("");
    setLocation("");
    setLatitude(null);
    setLongitude(null);
    setNearestMRT(null);
    setNearestMRTDistance(null);
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
                {eventToEdit ? "Event Updated!" : "Event Created!"}
              </h2>
              <p className="mb-6 text-gray-700">
                Your event <strong>{title}</strong> was{" "}
                {eventToEdit ? "updated" : "created"} successfully.
              </p>

              <a
                href="/my-events"
                className="inline-block bg-teal-500 text-white px-6 py-3 rounded-lg hover:bg-teal-600 transition mr-4"
              >
                Go to My Events
              </a>
              <button
                onClick={handleReset}
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
                {/* Event Title */}
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

                {/* Category & Skill Level */}
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

                {/* Date & Time */}
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

                {/* LOCATION SECTION - After Date/Time */}
                <LocationSection
                  location={location}
                  setLocation={setLocation}
                  latitude={latitude}
                  setLatitude={setLatitude}
                  longitude={longitude}
                  setLongitude={setLongitude}
                  nearestMRT={nearestMRT}
                  nearestMRTDistance={nearestMRTDistance}
                  category={category}
                  useMapPicker={useMapPicker}
                  setUseMapPicker={setUseMapPicker}
                  errors={errors}
                  onLocationSelect={handleLocationSelect}
                  getInputClassName={getInputClassName}
                />

                {/* Description */}
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

                {/* Capacity & Image */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 font-semibold">Max Participants *</label>
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
                    <label className="block mb-2 font-semibold">Upload Image (optional)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                      className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
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

export default function CreateEventPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <CreateEventContent />
    </Suspense>
  );
}
