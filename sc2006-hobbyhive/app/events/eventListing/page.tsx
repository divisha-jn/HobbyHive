

"use client";
import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Clock, Users, Heart, ChevronLeft, TrendingUp } from 'lucide-react';
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

interface EventListingProps {
  eventId: string;
}

interface EventData {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  image_url: string;
  category: string;
  skill_level: string;
  description: string;
  capacity: number;
  host_id: string;
  current_attendees: number;
}

export default function EventListing({ eventId }: EventListingProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isLiked, setIsLiked] = useState(false);
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hostName, setHostName] = useState("Host");
  const [isAttending, setIsAttending] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [message, setMessage] = useState("");
  const [attendees, setAttendees] = useState<any[]>([]);
  const fetchAttendees = async () => {
    try {
      const { data: participantData, error } = await supabase
        .from("event_participants")
        .select(`
          user_id,
          profiles (
            full_name,
            profile_picture
          )
        `)
        .eq("event_id", eventId);

      if (error) {
        console.error("Error fetching attendees:", error);
        return;
      }

      const attendeeList = participantData?.map((p: any, index: number) => ({
        id: index,
        name: p.profiles?.full_name || "Unknown",
        color: ['bg-blue-400', 'bg-purple-400', 'bg-pink-400', 'bg-green-400', 'bg-yellow-400'][index % 5],
      })) || [];

      setAttendees(attendeeList);
    } catch (err) {
      console.error("Error loading attendees:", err);
    }
  };

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        // Fetch event data
        const { data: eventData, error: eventError } = await supabase
          .from("events")
          .select("*")
          .eq("id", eventId)
          .single();

        if (eventError) {
          console.error("Error fetching event:", eventError);
        } else if (eventData) {
          setEvent(eventData);

          // Fetch host name
          const { data: userData } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", eventData.host_id)
            .single();

          if (userData) {
            setHostName(userData.full_name || "Host");
          }

          await fetchAttendees();

          // Check if user is already attending
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: participantData } = await supabase
              .from("event_participants")
              .select("*")
              .eq("event_id", eventId)
              .eq("user_id", user.id)
              .single();

            setIsAttending(!!participantData);
          }
        }
      } catch (err) {
        console.error("Unexpected error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId, supabase]);

  const handleJoinEvent = async () => {
    if (!event) return;

    setIsJoining(true);
    setMessage("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setMessage("Please log in to join the event");
        setIsJoining(false);
        return;
      }

      // Check current participant count
      const { count, error: countError } = await supabase
        .from("event_participants")
        .select("*", { count: "exact", head: true })
        .eq("event_id", eventId);

      if (count !== null && count >= event.capacity) {
        setMessage("Event is Full");
        setIsJoining(false);
        return;
      }

      // Add user to event participants
      const { error: joinError } = await supabase
        .from("event_participants")
        .insert([{ user_id: user.id, event_id: eventId }]);

      if (joinError) {
        console.error("Error joining event:", joinError);
        setMessage(joinError.message || "Error joining event");
      } else {
        setIsAttending(true);
        setMessage("Successfully joined!");
        // Update current attendees count
        setEvent(prev => prev ? { ...prev, current_attendees: (prev.current_attendees || 0) + 1 } : null);
        await fetchAttendees();
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setMessage("Error joining event");
    } finally {
      setIsJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-white flex items-center justify-center">
        <p>Loading event details...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-white flex items-center justify-center">
        <p>Event not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-white pb-24">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-cyan-100">
        <button onClick={() => router.back()}>
          <ChevronLeft className="w-6 h-6 text-gray-600" />
        </button>
        <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-cyan-500 bg-clip-text text-transparent">
          Event Details
        </span>
        <div className="w-6"></div>
      </div>

      {/* Event Image */}
      <div className="relative h-64 bg-gradient-to-br from-green-300 to-green-500 flex items-center justify-center overflow-hidden">
        <img
          src={event.image_url}
          alt={event.title}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="px-4 py-6">
        {/* Title Section */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-800 flex-1">{event.title}</h1>
            <button onClick={() => setIsLiked(!isLiked)} className="ml-3">
              <Heart className={`w-6 h-6 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
            </button>
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Active</span>
            <span className="px-3 py-1 bg-cyan-100 text-cyan-700 text-xs font-semibold rounded-full">{event.category}</span>
          </div>
        </div>

        {/* Host Info */}
        <div className="bg-cyan-50 rounded-xl p-4 mb-6 border border-cyan-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-300 to-orange-300 flex items-center justify-center font-bold text-white">
              {hostName.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-gray-800">{hostName}</p>
              <p className="text-xs text-gray-600">Event Host</p>
            </div>
          </div>
        </div>

        {/* Event Details */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-3 text-gray-700">
            <Calendar className="w-5 h-5 text-cyan-500 flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-500">Date</p>
              <p className="font-semibold">{new Date(event.date).toLocaleDateString('en-SG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-gray-700">
            <Clock className="w-5 h-5 text-cyan-500 flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-500">Time</p>
              <p className="font-semibold">{event.time}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-gray-700">
            <MapPin className="w-5 h-5 text-cyan-500 flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="font-semibold">{event.location}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-gray-700">
            <TrendingUp className="w-5 h-5 text-cyan-500 flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-500">Skill Level</p>
              <p className="font-semibold">{event.skill_level}</p>
            </div>
          </div>
        </div>

        {/* Attendees */}
        <div className="bg-cyan-50 rounded-xl p-4 mb-6 border border-cyan-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-600" />
              Attendees ({attendees.length}/{event.capacity})
            </h3>
          </div>
          <div className="flex -space-x-2 flex-wrap gap-y-2">
            {attendees.map((attendee) => (
              <div
                key={attendee.id}
                className={`w-10 h-10 rounded-full ${attendee.color} flex items-center justify-center text-white text-xs font-bold border-2 border-white hover:scale-110 transition cursor-pointer`}
                title={attendee.name}
              >
                {attendee.name.charAt(0)}
              </div>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-800 mb-3">About This Event</h3>
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex gap-2 text-gray-700">
              <span className="text-cyan-500 font-bold">•</span>
              <p>{event.description}</p>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-8">
          <span className="px-4 py-2 bg-cyan-100 text-cyan-700 text-sm font-medium rounded-full">{event.category}</span>
        </div>

        {/* Status Message */}
        {message && (
          <div className={`rounded-lg p-3 mb-8 text-center ${
            message === "Event is Full" 
              ? 'bg-red-50 border border-red-200' 
              : message === "Successfully joined!"
              ? 'bg-green-50 border border-green-200'
              : 'bg-yellow-50 border border-yellow-200'
          }`}>
            <p className={`font-semibold text-sm ${
              message === "Event is Full" 
                ? 'text-red-700' 
                : message === "Successfully joined!"
                ? 'text-green-700'
                : 'text-yellow-700'
            }`}>
              {message === "Event is Full" ? '✗ ' : message === "Successfully joined!" ? '✓ ' : '⚠ '}
              {message}
            </p>
          </div>
        )}

        {/* Attendance Status */}
        {isAttending && !message && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-8 text-center">
            <p className="text-green-700 font-semibold text-sm">✓ You are attending this event</p>
          </div>
        )}
      </div>

      {/* Bottom Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-cyan-100 p-4">
        {isAttending ? (
          <button className="w-full py-3 bg-gradient-to-r from-cyan-400 to-cyan-500 text-white font-semibold rounded-lg hover:from-cyan-500 hover:to-cyan-600 transition shadow-lg">
            Go to Chat
          </button>
        ) : (
          <button 
            onClick={handleJoinEvent}
            disabled={isJoining}
            className= "w-full py-3 bg-gradient-to-r from-cyan-400 via-cyan-450 to-teal-500 text-white font-semibold rounded-lg hover:from-cyan-500 hover:to-cyan-600 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isJoining ? 'Joining...' : 'Join'}
          </button>
        )}
      </div>
    </div>
  );
}