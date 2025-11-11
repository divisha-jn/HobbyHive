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
  isLoading: boolean;
  isEditing: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  getInputClassName: (fieldName: string) => string;
}
