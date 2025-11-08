"use client";

import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Header from "../components/header";
import Sidebar from "./components/Sidebar";
import ChatRoom from "./components/Chatroom";

import { getCurrentUserId } from "./model/userModel";
import { ChatController } from "./controllers/chatController";
import type { GroupChatListItem } from "./model/groupchatModel";

export default function Page() {
  const [userId, setUserId] = useState<string | null>(null);
  const [groupChats, setGroupChats] = useState<GroupChatListItem[]>([]);
  const [selectedChat, setSelectedChat] = useState<GroupChatListItem | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);

  // get current user 
  useEffect(() => {
    getCurrentUserId().then(setUserId).catch(console.error);
  }, []);

  // load user's group chats
  useEffect(() => {
    if (!userId) return;
    ChatController.fetchGroupChats(userId)
      .then((chats) => {
        setGroupChats(chats);
      })
      .catch((e) => console.error("Fetch group chats error:", e));
  }, [userId]);

  return (
    <div className="h-screen flex flex-col p-2 bg-white">
      {/* header */}
      <div className="absolute top-2 left-4 z-50">
        <Navbar />
      </div>
      <Header />

      {/* layout */}
      <div className="Chat p-0 gap-4 flex flex-row flex-1 overflow-hidden mt-2">
        {/* Sidebar */}
        <Sidebar
          chats={groupChats}
          onSelectChat={setSelectedChat}
          selectedChatId={selectedChat?.chat_id ?? null}
          show={showSidebar}
          toggle={() => setShowSidebar((s) => !s)}
        />

        {/* Chat room */}
        <ChatRoom
          selectedChat={selectedChat}
          userId={userId}
          setGroupChats={setGroupChats}
          setSelectedChat={setSelectedChat}
        />
      </div>
    </div>
  );
}
