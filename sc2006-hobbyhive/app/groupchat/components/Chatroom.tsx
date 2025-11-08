"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import type { GroupChatListItem } from "../model/groupchatModel";
import type { MessageRow } from "../model/messageModel";
import MemberList from "./MemberList";
import { ChatController } from "../controllers/chatController";
import MessageInput from "./MessageInput";


type Props = {
  selectedChat: GroupChatListItem | null;
  userId: string | null;
  setGroupChats?: React.Dispatch<React.SetStateAction<GroupChatListItem[]>>;
  setSelectedChat?: React.Dispatch<React.SetStateAction<GroupChatListItem | null>>;
};


export default function ChatRoom({
  selectedChat,
  userId,
  setGroupChats,
  setSelectedChat,
    }: Props) {
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [hostId, setHostId] = useState<string | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [showMembers, setShowMembers] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const chatId = selectedChat?.chat_id ?? null;

  // load messages
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    async function load() {
      if (!chatId) {
        setMessages([]);
        return;
      }

      try {
        const data = await ChatController.fetchMessages(chatId);
        setMessages(data);
      } catch (e) {
        console.error("Fetch messages error:", e);
      }

      // realtime update
      unsubscribe = ChatController.subscribeToMessages(chatId, (msg) => {
        setMessages((prev) => [...prev, msg]);
      });
    }

    load();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [chatId]);

  // fetch host id for perms
  useEffect(() => {
    setHostId(null);
    if (!chatId) return;

    ChatController.fetchHostIdByChatId(chatId)
      .then(setHostId)
      .catch((e) => console.error("Fetch host error:", e));
  }, [chatId]);

  // fetch members
  const refreshMembers = async () => {
    if (!chatId) return;
    setMembersLoading(true);
    try {
      const rows = await ChatController.fetchMembers(chatId);
      setMembers(rows);
    } catch (e) {
      console.error("Fetch members error:", e);
    } finally {
      setMembersLoading(false);
    }
  };

  // fetch members on the first load
  useEffect(() => {
    if (showMembers && chatId) {
      void refreshMembers();
    }
  }, [showMembers, chatId]);

  // auto scroll 
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
  }, [messages]);

  const header = useMemo(() => {
    if (!selectedChat) return null;
    return (
      <div className="bg-gradient-to-r from-teal-500 to-cyan-500 p-4 border-b-2 border-teal-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={selectedChat.image_url}
            alt={selectedChat.event_title}
            className="w-12 h-12 rounded-lg object-cover"
          />
          <div>
            <h2 className="text-xl font-bold text-white">{selectedChat.event_title}</h2>
          </div>
        </div>
        <button
          onClick={() => setShowMembers((s) => !s)}
          className="btn btn-sm btn-outline text-white border-white hover:bg-white hover:text-teal-500 rounded-xl"
        >
          👥 {showMembers ? "Hide" : "View"} Members
        </button>
      </div>
    );
  }, [selectedChat, showMembers]);

  if (!selectedChat) {
    return (
      <div className="Chatroom border-2 border-base-400 p-0 flex flex-col flex-1 rounded-2xl h-full bg-white overflow-hidden">
        <div className="flex items-center justify-center h-full text-gray-400 text-xl">
          <p>Select a chat to start messaging</p>
        </div>
      </div>
    );
  }

  const handleSend = async (text: string) => {
    if (!chatId || !userId) return;
    try {
      await ChatController.sendMessage(chatId, userId, text);
    } catch (e) {
      console.error("Send message error:", e);
    }
  };
//leave groupchat
const handleLeave = async () => {
  if (!chatId || !userId) return;

  try {
    await ChatController.leaveGroup(chatId, userId);

    setShowMembers(false);
    setMembers([]);
    setMessages([]);
    setHostId(null);

    setGroupChats?.((prev: any[]) =>
      prev.filter((chat) => chat.chat_id !== chatId)
    );

    setSelectedChat?.(null);
  } catch (e) {
    console.error("Leave group error:", e);
  }
};

  const handleRemove = async (memberId: string) => {
    if (!chatId) return;
    try {
      await ChatController.removeMember(chatId, memberId);
      setMembers((prev) => prev.filter((m) => m.user_id !== memberId));
    } catch (e) {
      console.error("Remove member error:", e);
    }
  };

  return (
    <div className="Chatroom border-2 border-base-400 p-0 flex flex-col flex-1 rounded-2xl h-full bg-white overflow-hidden">
      {/* header */}
      {header}

      {/* members panel */}
      {showMembers && (
        <MemberList
          members={members}
          userId={userId}
          hostId={hostId}
          onLeave={handleLeave}
          onRemove={handleRemove}
          loading={membersLoading}
        />
      )}

      {/* messages */}
      <div className="flex-1 p-2 space-y-4 rounded-lg overflow-y-auto text-xl">
        {messages.length > 0 ? (
          messages.map((msg) => (
            <div key={msg.id}>
              <div className={`${msg.sender_id === userId ? "chat chat-start" : "chat chat-end"}`}>
                <div className="chat chat-header">{msg.profiles?.username ?? "User"}</div>
                <p className="chat-bubble">{msg.content}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center">No messages yet...</p>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* input */}
      <div className="w-full">
            <MessageInput onSend={handleSend} />
      </div>
    </div>
  );
}
