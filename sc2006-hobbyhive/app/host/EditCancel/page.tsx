"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import dynamic from "next/dynamic";

const LocationMapPicker = dynamic(
  () => import("../../components/LocationMapPicker"),
  { ssr: false }
);

export default function EditCancelPage() {
  const [useMapPicker, setUseMapPicker] = useState(false);
  const handleLocationSelect = (locationName: string) => {
    setForm({ ...form, location: locationName });
  };
  const searchParams = useSearchParams();
  const eventId = searchParams.get("event_id");
  const mode = searchParams.get("mode"); // "edit" or "cancel"
  const router = useRouter();
  const supabase = createClient();

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    capacity: "",
  });

  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) return;
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();

      if (!error && data) {
        setEvent(data);
        setForm({
          title: data.title || "",
          description: data.description || "",
          date: data.date || "",
          time: data.time || "",
          location: data.location || "",
          capacity: data.capacity?.toString() || "",
        });
      }
      setLoading(false);
    };
    fetchEvent();
  }, [eventId]);

  const handleCancel = async () => {
    const confirmCancel = confirm("Are you sure you want to cancel this event?");
    if (!confirmCancel) return;

    setLoading(true);
    const { error } = await supabase
      .from("events")
      .update({ status: "cancelled" })
      .eq("id", eventId);

    setLoading(false);

    if (error) alert("Error cancelling event");
    else {
      alert("Event cancelled successfully!");
      router.push("/MyEvents");
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from("events")
      .update({
        title: form.title,
        description: form.description,
        date: form.date,
        time: form.time,
        location: form.location,
        capacity: Number(form.capacity),
      })
      .eq("id", eventId);

    setLoading(false);

    if (error) alert("Error updating event");
    else {
      alert("Event updated successfully!");
      router.push("/MyEvents");
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (!event) return <p className="p-6">Event not found.</p>;

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center p-6">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">
          {mode === "edit" ? "Edit Event Details" : "Cancel Event"}
        </h1>

        {mode === "cancel" ? (
          <>
            <p className="text-gray-700 mb-4">
              <b>{event.title}</b><br />
              {event.date} — {event.time}<br />
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
          </>
        ) : (
          <form onSubmit={handleEdit} className="flex flex-col gap-4 text-left">
            <label>
              Title:
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="border p-2 w-full rounded mt-1"
                required
              />
            </label>

            <label>
              Description:
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="border p-2 w-full rounded mt-1"
                rows={3}
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label>
                Date:
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="border p-2 w-full rounded mt-1"
                  required
                />
              </label>

              <label>
                Time:
                <input
                  type="time"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  className="border p-2 w-full rounded mt-1"
                  required
                />
              </label>
            </div>

            <label className="block mb-2 font-semibold">Location *</label>
            <div className="flex justify-between items-center mb-2">
              <button
                type="button"
                onClick={() => setUseMapPicker(!useMapPicker)}
                className="text-sm bg-teal-100 text-teal-700 px-3 py-1 rounded hover:bg-teal-200 transition"
              >
                {useMapPicker ? "📝 Switch to Manual Entry" : "🗺️ Use Map Picker"}
              </button>
            </div>

            {useMapPicker ? (
              <>
                <LocationMapPicker
                  onLocationSelect={handleLocationSelect}
                  selectedLocation={form.location}
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
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="border p-2 w-full rounded mt-1"
                required
              />
            )}

            <label>
              Capacity:
              <input
                type="number"
                min="1"
                value={form.capacity}
                onChange={(e) =>
                  setForm({ ...form, capacity: e.target.value })
                }
                className="border p-2 w-full rounded mt-1"
                required
              />
            </label>

            <div className="flex justify-center gap-4 mt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-100"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

