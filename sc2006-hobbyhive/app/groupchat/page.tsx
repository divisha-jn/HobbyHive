"use client";
import React, { useEffect, useState, useRef , useMemo} from "react";
import { createClient } from "../../utils/supabase/client";
import Navbar from "../components/Navbar";

const MOCK_EVENT_ID = "f81d4fae-7dec-11d0-a765-00a0c91e6bf6";
const MOCK_CHAT_ID = "a8e019cc-a8c7-4da8-9a22-45abe5c87b71";

const Page = () => {
  const supabase = useMemo(() => createClient(), []);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ sender_id: string; content: string }[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) setUserId(data.user.id);
    };
    fetchUser();
  }, []);


  // fetch existing messages
  useEffect(() => {
  const fetchMsgs = async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("chat_id", MOCK_CHAT_ID)
      .order("created_at", { ascending: true });

      if (error) {
        console.error("Fetch error:", error.message);
      } else if (data) {
        setMessages(data);  
      }
  };

  fetchMsgs();
}, []);

  useEffect(() => {
    const channel = supabase
    .channel("live_updates")
    .on("postgres_changes",
      {event:"INSERT", schema: "public", table: "messages", filter: `chat_id=eq.${MOCK_CHAT_ID}`},
      (payload) => {
        setMessages((prev) => [...prev, payload.new as {sender_id: string, content: string}]);
      }
    )
    .subscribe();

    return () => {
      supabase.removeChannel(channel);
      
    };
  }, [MOCK_CHAT_ID]);


  // auto-scroll when messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "instant" });
    }
  }, [messages]);

  // send message
  const handleSend = async () => {
    if (!input.trim()) return;

    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user) return;

    const USER_ID = user.id;

    const { error } = await supabase.from("messages").insert([
      {
        chat_id: MOCK_CHAT_ID,
        sender_id: USER_ID,
        content: input,
      },
    ]);
    setInput("");
    if (error) console.error("Insert error:", error.message, error.details, error.hint);

  };

  return (
    <div className="h-screen flex flex-col p-2">
      {/* header */}
      <div className="flex flex-row px-2">
        <span>
          <Navbar />
        </span>
        <div className="text-5xl flex-1 text-center text-cyan-300">HobbyHive</div>
        <div className="w-[40px]" />
      </div>

      {/* layout */}
      <div className="Chat p-0 gap-4 flex flex-row flex-1 overflow-hidden">
        {/* sidebar groups */}
        <ul className="list bg-base-100 rounded-box shadow-md p-5 w-1/4 overflow-y-auto">
          <li className="list-row hover:bg-base-200">
            <div>
              <img className="size-10 rounded-box" src="https://img.daisyui.com/images/profile/demo/1@94.webp" />
            </div>
            <p className="text-xl">Group 1</p>
          </li>
          <li className="list-row hover:bg-base-200">
            <div>
              <img className="size-10 rounded-box" src="https://img.daisyui.com/images/profile/demo/4@94.webp" />
            </div>
            <p className="text-xl">Group 2</p>
          </li>
          <li className="list-row hover:bg-base-200">
            <div>
              <img className="size-10 rounded-box" src="https://img.daisyui.com/images/profile/demo/3@94.webp" />
            </div>
            <p className="text-xl">Group 3</p>
          </li>
        </ul>

        {/* chat room */}
        <div className="Chatroom border-1 border-base-400 p-2 flex flex-col flex-1 rounded-2xl h-full">
          <div className="flex-1 p-2 space-y-4 rounded-lg overflow-y-auto">
            {messages.length > 0 ? (
              messages.map((msg, idx) => (
                <div key={idx}>
                  <div className={`${msg.sender_id === userId ? "chat chat-start" : "chat chat-end"}`}>
                    <div className="chat chat-header">{msg.sender_id}</div>
                    <p className="chat-bubble">{msg.content}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center">No messages yet...</p>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* input bar */}
          <div className="flex p-2 gap-4 items-end w-full">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (input.trim() !== "") handleSend();
                }
              }}
              placeholder="Enter your message..."
              className="input input-bordered w-full"
            />
            <button onClick={handleSend} className="btn btn-accent rounded-xl font-bold">
              send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
