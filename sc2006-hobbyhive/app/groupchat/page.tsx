"use client"
import React, { useEffect } from 'react'
import { createClient } from "../../utils/supabase/client";
import Link from "next/link";
import Header from "../components/header";
import { useState, useRef } from 'react';
import Navbar from "../components/Navbar";


const MOCK_EVENT_ID = "f81d4fae-7dec-11d0-a765-00a0c91e6bf6";
const MOCK_CHAT_ID = "a8e019cc-a8c7-4da8-9a22-45abe5c87b71";

const groups = [
  { id: 1, name: "Group 1", avatar: "https://img.daisyui.com/images/profile/demo/1@94.webp", lastMessage: "Where are we meet...", active: true },
  { id: 2, name: "Group 2", avatar: "https://img.daisyui.com/images/profile/demo/4@94.webp", lastMessage: "ya sure..." },
  { id: 3, name: "Group 3", avatar: "https://img.daisyui.com/images/profile/demo/3@94.webp", lastMessage: "Hey there!" }
];

const page = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{sender_id: string; content: string}[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState(groups[0]);

  useEffect(() => {
    const fetchUser =  async () => {  
      const supabase = createClient();
      const {data} = await supabase.auth.getUser();
      setUserId(data.user!.id) };
      fetchUser();
  }, []);

  useEffect(() => {
    const fetchMsgs = async () => {
      const supabase = createClient();
      const {data, error} = await supabase
        .from("messages")
        .select("*")
        .eq("chat_id", MOCK_CHAT_ID)
        .order("created_at", {ascending : true}) 
      if (!error && data ) {
        
        setMessages(data) }

    };
    fetchMsgs();
  }, []);
  
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({behavior:"instant"});
    }
  }, [messages]);

  const handleSend = async () => {  
    if(!input.trim()) return;
    const supabase = createClient();
    const {data} = await supabase.auth.getUser();
    const user = data.user;
    const USER_ID = user!.id;
    setMessages((prev) =>[...prev, {sender_id:USER_ID,content:input}]);

    const {error} = await supabase
    .from("messages")
    .insert([
      {
        chat_id: MOCK_CHAT_ID,
        sender_id:USER_ID,
        content: input,
      }
    ]);
    setInput('');
 
  }

  return (
    <div className="h-screen flex flex-col bg-teal-50">
      
      {/* Navbar */}
      <div className="absolute top-2 left-4 z-50">
        <Navbar />
      </div>
      {/* Header */}
      <Header />
      
      {/*main layout*/}
      <div className="flex flex-row gap-1 flex-1 overflow-hidden">
        {/* side chatgroups*/}
        <div className="w-80 bg-white/80 backdrop-blur-sm rounded-xl shadow-xl p-4 flex flex-col overflow-hidden">
          <h2 className="text-xl font-bold text-gray-700 mb-4 px-2">Chat Groups</h2>
          <div className="flex-1 overflow-y-auto space-y-2">
            {groups.map((group) => (
              <div
                key={group.id}
                onClick={() => setSelectedGroup(group)}
                className={`flex items-center gap-3 p-3 rounded-xl hover:bg-teal-50 cursor-pointer transition-all ${
                  selectedGroup.id === group.id ? 'bg-teal-100 border-l-4 border-teal-400 shadow-md' : ''
                }`}
              >
                <img 
                  src={group.avatar} 
                  alt={group.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-teal-200"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800">{group.name}</p>
                  <p className="text-sm text-gray-500 truncate">{group.lastMessage}</p>
                </div>
                {group.active && (
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/*chat room*/}
        <div className="flex-1 bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl flex flex-col overflow-hidden">
          {/* Chat Header */}
          <div className="bg-white/90 border-b border-teal-100 p-4 rounded-t-2xl flex items-center gap-3">
            <img 
              src={selectedGroup.avatar} 
              alt={selectedGroup.name}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-teal-300"
            />
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 text-lg">{selectedGroup.name}</h3>
              {selectedGroup.active && (
              <p className="text-xs text-green-500">● Active now</p>
              )}
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 space-y-3 overflow-y-auto">
            {messages.length > 0 ? (
              messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender_id === userId ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-md ${
                    msg.sender_id === userId 
                      ? 'bg-gradient-to-r from-teal-400 to-cyan-400 text-white' 
                      : 'bg-white border border-gray-200'
                  } rounded-2xl px-4 py-3 shadow-md`}>
                    <p className={`text-sm font-medium ${msg.sender_id === userId ? 'text-white' : 'text-gray-800'}`}>
                      {msg.content}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-400 text-center">No messages yet. Start the conversation!</p>
              </div>
            )}
            <div ref={messagesEndRef}/>
          </div>
        
          {/*input bar*/}
          <div className="bg-white/90 border-t border-teal-100 p-4 rounded-b-2xl">
            <div className="flex gap-3 items-center">
              <input 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                onKeyDown={(e) => {
                  if(e.key === "Enter") {
                    e.preventDefault();
                    if(input.trim() !== "")
                      handleSend();
                  }
                }}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim()}
                className="px-6 py-3 bg-gradient-to-r from-teal-400 to-cyan-400 text-white rounded-full font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default page;
 
 
 
 
 

  
  
