"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { getLocationConfigForCategory } from "@/app/config/categoryLocationMapping";
import LocationAutocompleteInput from "@/app/components/LocationAutocompleteInput";
import Header from "@/app/components/header";
import Navbar from "@/app/components/Navbar";
import { EventController } from "@/app/host/controllers/EventController";
import { EventModel } from "@/app/host/models/EventModel";


const LocationMapPicker = dynamic(
  () => import("@/app/components/LocationMapPicker"),
  { ssr: false }
);


function EditCancelContent() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get("event_id");
  const mode = searchParams.get("mode");
  const router = useRouter();


  // Initialize MVC
  const eventModel = new EventModel();
  const eventController = new EventController(eventModel);


  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [useMapPicker, setUseMapPicker] = useState(false);


  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    category: "",
    capacity: "",
    skillLevel: "",
  });


  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [nearestMRT, setNearestMRT] = useState<string | null>(null);
  const [nearestMRTDistance, setNearestMRTDistance] = useState<number | null>(null);


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


  // Fetch event data
  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) return;


      const { data, error } = await eventController.fetchEventById(eventId);


      if (!error && data) {
        setEvent(data);
        setForm({
          title: data.title || "",
          description: data.description || "",
          date: data.date || "",
          time: data.time || "",
          location: data.location || "",
          category: data.category || "",
          capacity: data.capacity?.toString() || "",
          skillLevel: data.skill_level || "",
        });


        if (data.latitude) setLatitude(data.latitude);
        if (data.longitude) setLongitude(data.longitude);
        if (data.nearest_mrt_station) setNearestMRT(data.nearest_mrt_station);
        if (data.nearest_mrt_distance) setNearestMRTDistance(data.nearest_mrt_distance);
      }
      setLoading(false);
    };
    fetchEvent();
  }, [eventId]);


  // Handle location selection with MRT calculation
  const handleLocationSelect = async (locationName: string, lat?: number, lng?: number) => {
    setForm({ ...form, location: locationName });


    if (lat !== undefined && lng !== undefined) {
      setLatitude(lat);
      setLongitude(lng);


      const mrtInfo = await eventController.calculateNearestMRT(lat, lng);
      if (mrtInfo) {
        setNearestMRT(mrtInfo.name);
        setNearestMRTDistance(mrtInfo.distance);
      }
    }
  };


  // Handle cancel event
  const handleCancel = async () => {
    const confirmCancel = confirm("Are you sure you want to cancel this event?");
    if (!confirmCancel) return;


    setLoading(true);
    const result = await eventController.cancelEvent(eventId!);
    setLoading(false);


    if (result.error) {
      alert("Error cancelling event");
    } else {
      alert("Event cancelled successfully!");
      router.push("/my-events");
    }
  };


  // Handle edit event
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();


    // Use controller for validation and update
    const formData = {
      title: form.title,
      category: form.category,
      skillLevel: form.skillLevel,
      date: form.date,
      time: form.time,
      location: form.location,
      capacity: form.capacity,
      description: form.description,
      latitude,
      longitude,
      nearestMRT,
      nearestMRTDistance,
    };


    setLoading(true);
    const result = await eventController.updateEvent(
      eventId!,
      formData,
      null, // No image file upload in edit mode
      event?.image_url
    );
    setLoading(false);


    if (!result.success) {
      alert(result.message || "Error updating event");
    } else {
      alert("Event updated successfully!");
      router.push("/my-events");
    }
  };


  if (loading) return <p className="p-6">Loading...</p>;
  if (!event) return <p className="p-6">Event not found.</p>;


  return (
    <div className="min-h-screen bg-gradient-to-r from-teal-400 to-cyan-500 relative">
      <div className="absolute top-2 left-4 z-50">
        <Navbar />
      </div>
      <Header />
      <div className="min-h-screen bg-gray-50 flex justify-center items-center p-6">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-2xl">
          <h1 className="text-2xl font-bold mb-6 text-center">
            {mode === "edit" ? "Edit Event Details" : "Cancel Event"}
          </h1>


          {mode === "cancel" ? (
            <div className="text-center">
              <p className="text-gray-700 mb-4">
                <b>{event.title}</b>
                <br />
                {event.date} — {event.time}
                <br />
                {event.location}
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => router.back()}
                  className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-100"
                >
                  Back
                </button>
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  {loading ? "Cancelling..." : "Cancel Event"}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleEdit} className="space-y-4 text-left">
              <div>
                <label className="block mb-2 font-semibold">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="border p-3 w-full rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>


              <div>
                <label className="block mb-2 font-semibold">Category *</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="border p-3 w-full rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
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
                  value={form.skillLevel}
                  onChange={(e) => setForm({ ...form, skillLevel: e.target.value })}
                  className="border p-3 w-full rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                >
                  <option value="">Select skill level</option>
                  <option value="Beginner friendly">Beginner friendly</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="All levels welcome">All levels welcome</option>
                </select>
              </div>


              <div>
                <label className="block mb-2 font-semibold">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="border p-3 w-full rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                  rows={3}
                />
              </div>


              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-2 font-semibold">Date *</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    min={(() => {
                      const today = new Date();
                      today.setDate(today.getDate() + 2);
                      return today.toISOString().split('T')[0];
                    })()}
                    className="border p-3 w-full rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Must be at least 2 days from today
                  </p>
                </div>


                <div>
                  <label className="block mb-2 font-semibold">Time *</label>
                  <input
                    type="time"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    className="border p-3 w-full rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
              </div>


              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block font-semibold">Location *</label>
                  {form.category &&
                    getLocationConfigForCategory(form.category).showMapPicker && (
                      <button
                        type="button"
                        onClick={() => setUseMapPicker(!useMapPicker)}
                        className="text-sm bg-teal-100 text-teal-700 px-3 py-1 rounded hover:bg-teal-200 transition"
                      >
                        {useMapPicker ? "📝 Switch to Manual Entry" : "🗺️ Use Map Picker"}
                      </button>
                    )}
                </div>


                {!form.category && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded mb-3 text-sm text-yellow-800">
                    ⚠️ Please select a category first
                  </div>
                )}


                {useMapPicker &&
                form.category &&
                getLocationConfigForCategory(form.category).showMapPicker ? (
                  <>
                    <LocationMapPicker
                      onLocationSelect={handleLocationSelect}
                      selectedLocation={form.location}
                      eventCategory={form.category}
                    />
                    {form.location && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                        <p className="text-sm text-green-800">
                          <strong>Selected:</strong> {form.location}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <LocationAutocompleteInput
                    location={form.location}
                    setLocation={(loc) => setForm({ ...form, location: loc })}
                    onCoordinatesSelect={async (lat, lng) => {
                      setLatitude(lat);
                      setLongitude(lng);
                      const mrtInfo = await eventController.calculateNearestMRT(lat, lng);
                      if (mrtInfo) {
                        setNearestMRT(mrtInfo.name);
                        setNearestMRTDistance(mrtInfo.distance);
                      }
                    }}
                    disabled={!form.category}
                    className="border p-3 w-full rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                )}
              </div>


              {nearestMRT && nearestMRTDistance && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-sm text-blue-800">
                    🚇 <strong>Nearest MRT:</strong> {nearestMRT} ({nearestMRTDistance} km away)
                  </p>
                </div>
              )}


              <div>
                <label className="block mb-2 font-semibold">Capacity *</label>
                <input
                  type="number"
                  min="1"
                  value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                  className="border p-3 w-full rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>


              <div className="flex justify-center gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="border border-gray-300 px-6 py-3 rounded hover:bg-gray-100"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-teal-500 text-white px-6 py-3 rounded hover:bg-teal-600 disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}


export default function EditCancelPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <EditCancelContent />
    </Suspense>
  );
}
