"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
}

export default function EditCancelPage() {
  const supabase = createClient();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHostedEvents();
  }, []);

  const fetchHostedEvents = async () => {
    setLoading(true);
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      console.error(error);
      setLoading(false);
      return;
    }

    try {
      const { data: hostedData, error: hostedError } = await supabase
        .from("events")
        .select("*")
        .eq("host_id", user.id)
        .order("date", { ascending: true });

      if (hostedError) throw hostedError;

      setEvents(hostedData || []);
    } catch (err) {
      console.error("Failed to fetch events", err);
    } finally {
      setLoading(false);
    }
  };
