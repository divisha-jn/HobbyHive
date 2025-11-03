"use client";
import React, { useEffect, useState, useRef, useMemo } from "react";
import { createClient } from "../../../utils/supabase/client";
import Navbar from "../../components/Navbar";
import Header from "../../components/header";

export default function EventChatPage({ params }: { params: Promise<{ event_id: string }> }) {
  const supabase = useMemo(() => createClient(), []);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [eventDetails, setEventDetails] = useState<any>(null);
  const [chatId, setChatId] = useState<string | null>(null);
  const [hostName, setHostName] = useState<string>("");
  const [resolvedParams, setResolvedParams] = useState<{ event_id: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Resolve params promise
  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params;
      setResolvedParams(resolved);
    };
    resolveParams();
  }, [params]);

  // Get logged-in user
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) setUserId(data.user.id);
    };
    fetchUser();
  }, [supabase]);

  // Get group chat info, messages, and host details
  useEffect(() => {
    if (!resolvedParams?.event_id) return;

    const fetchChat = async () => {
      const eventId = resolvedParams.event_id;

      try {
        // Fetch event details with host information
        const { data: eventData, error: eventError } = await supabase
          .from("events")
          .select(`
            id,
            title,
            image_url,
            host_id,
            profiles!events_host_id_fkey(
              username
            )
          `)
          .eq("id", eventId)
          .single();

        if (eventError) {
          console.error("Error fetching event:", eventError.message);
          return;
        }

        setEventDetails(eventData);
        
        // Handle array structure for profiles
        if (eventData.profiles && Array.isArray(eventData.profiles) && eventData.profiles.length > 0) {
          setHostName(eventData.profiles[0].username || "Unknown Host");
        } else {
          setHostName("Unknown Host");
        }

        // Fetch or create group chat for this event
        const { data: chatData, error: chatError } = await supabase
          .from("group_chats")
          .select("id")
          .eq("event_id", eventId)
          .single();

        if (chatError) {
          // If chat doesn't exist, create one
          if (chatError.code === 'PGRST116') {
            const { data: newChat, error: createError } = await supabase
              .from("group_chats")
              .insert([{ event_id: eventId }])
              .select("id")
              .single();

            if (createError) {
              console.error("Error creating chat:", createError.message);
              return;
            }
            setChatId(newChat.id);
            
            // Fetch messages after creating chat
            if (newChat.id) {
              const { data: msgData, error: msgError } = await supabase
                .from("messages")
                .select(`
                  id, 
                  sender_id, 
                  content, 
                  created_at, 
                  profiles!messages_sender_id_fkey(
                    username
                  )
                `)
                .eq("chat_id", newChat.id)
                .order("created_at", { ascending: true });

              if (msgError) console.error("Error fetching messages:", msgError.message);
              
              // Handle array structure for messages
              const formattedMessages = msgData?.map(msg => ({
                ...msg,
                profiles: msg.profiles && Array.isArray(msg.profiles) ? msg.profiles[0] : null
              })) || [];
              
              setMessages(formattedMessages);
            }
          } else {
            console.error("Error fetching chat:", chatError.message);
            return;
          }
        } else {
          setChatId(chatData.id);
          
          // Fetch existing messages for existing chat
          const { data: msgData, error: msgError } = await supabase
            .from("messages")
            .select(`
              id, 
              sender_id, 
              content, 
              created_at, 
              profiles!messages_sender_id_fkey(
                username
              )
            `)
            .eq("chat_id", chatData.id)
            .order("created_at", { ascending: true });

          if (msgError) console.error("Error fetching messages:", msgError.message);
          
          // Handle array structure for messages
          const formattedMessages = msgData?.map(msg => ({
            ...msg,
            profiles: msg.profiles && Array.isArray(msg.profiles) ? msg.profiles[0] : null
          })) || [];
          
          setMessages(formattedMessages);
        }

      } catch (err) {
        console.error("Unexpected error:", err);
      }
    };

    fetchChat();
  }, [resolvedParams, supabase]);

  // Real-time updates
  useEffect(() => {
    if (!chatId) return;

    const channel = supabase
      .channel(`chat_${chatId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `chat_id=eq.${chatId}` },
        async (payload) => {
          const { data: profileData, error } = await supabase
            .from("profiles")
            .select("username")
            .eq("id", payload.new.sender_id);

          if (error) {
            console.error("Error fetching profile:", error.message);
            return;
          }

          // Handle array structure for real-time messages
          const profile = profileData && Array.isArray(profileData) && profileData.length > 0 
            ? profileData[0] 
            : null;

          setMessages((prev) => [...prev, { 
            ...payload.new, 
            profiles: profile 
          }]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId, supabase]);

  // Auto-scroll
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Send message
  const handleSend = async () => {
    if (!input.trim() || !chatId || !userId) return;

    const { error } = await supabase.from("messages").insert([
      {
        chat_id: chatId,
        sender_id: userId,
        content: input.trim(),
      },
    ]);

    if (error) console.error("Error sending message:", error.message);
    setInput("");
  };

  // Leave group function
  const handleLeaveGroup = async () => {
    if (!userId || !resolvedParams?.event_id) return;

    try {
      // Remove user from event participants
      const { error } = await supabase
        .from("event_participants")
        .delete()
        .eq("user_id", userId)
        .eq("event_id", resolvedParams.event_id);

      if (error) {
        console.error("Error leaving group:", error.message);
      } else {
        // Redirect to events page or show success message
        alert("You have left the event group");
        window.location.href = "/events";
      }
    } catch (err) {
      console.error("Unexpected error leaving group:", err);
    }
  };

  if (!resolvedParams) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="absolute top-2 left-4 z-50">
          <Navbar />
        </div>
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="absolute top-2 left-4 z-50">
        <Navbar />
      </div>
      <Header />

      <div className="flex-1 flex flex-col mt-4 p-4 max-w-3xl mx-auto border border-gray-300 rounded-lg shadow-md">
        {/* Enhanced Chat Header */}
        <div className="border-b border-gray-200 pb-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {eventDetails?.image_url && (
                <img
                  src={eventDetails.image_url}
                  alt={eventDetails?.title || "Event"}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              )}
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  {eventDetails?.title || "Event Chat"}
                </h1>
                <p className="text-gray-600">
                  Hosted by: <span className="font-semibold">{hostName}</span>
                </p>
              </div>
            </div>
            <button
              onClick={handleLeaveGroup}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-200 font-medium"
            >
              Leave Group
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-3 max-h-96">
          {messages.length > 0 ? (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender_id === userId ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`rounded-xl px-4 py-2 max-w-xs ${
                    msg.sender_id === userId
                      ? "bg-teal-500 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  <p className="font-semibold text-sm">{msg.profiles?.username || "Unknown User"}</p>
                  <p className="mt-1">{msg.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(msg.created_at).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">No messages yet. Start the conversation!</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
