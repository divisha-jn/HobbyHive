"use client";
import React from "react";

interface EventFormProps {
  title: string;
  setTitle: (title: string) => void;
  date: string;
  setDate: (date: string) => void;
  time: string;
  setTime: (time: string) => void;
  description: string;
  setDescription: (description: string) => void;
  capacity: string;
  setCapacity: (capacity: string) => void;
  category: string;
  setCategory: (category: string) => void;
  skillLevel: string;
  setSkillLevel: (skillLevel: string) => void;
  imageFile: File | null;
  setImageFile: (file: File | null) => void;
  errors: { [key: string]: boolean };
  getInputClassName: (fieldName: string) => string;
}

export default function EventForm({
  title,
  setTitle,
  date,
  setDate,
  time,
  setTime,
  description,
  setDescription,
  capacity,
  setCapacity,
  category,
  setCategory,
  skillLevel,
  setSkillLevel,
  imageFile,
  setImageFile,
  errors,
  getInputClassName,
}: EventFormProps) {
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

  return (
    <>
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

      {/* Description moved to separate section below Location */}
      
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
    </>
  );
}
