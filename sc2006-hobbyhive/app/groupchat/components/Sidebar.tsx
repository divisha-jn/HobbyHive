"use client";

import React from "react";
import type { GroupChatListItem } from "../model/groupchatModel";

type Props = {
  chats: GroupChatListItem[];
  onSelectChat: (chat: GroupChatListItem) => void;
  selectedChatId?: string | null;
  show: boolean;
  toggle: () => void;
};

export default function Sidebar({ chats, onSelectChat, selectedChatId, show, toggle }: Props) {
  return (
    <>
      <button onClick={toggle} className="btn btn-sm btn-accent">
        {show ? "Close" : "Open"}
      </button>

      {show && (
        <ul className="list rounded-box shadow-md p-5 w-1/4 overflow-y-auto border-2 bg-teal-500">
          {chats.length > 0 ? (
            chats.map((chat) => (
              <li
                key={chat.chat_id}
                className={`flex items-center gap-3 py-6 rounded-xl cursor-pointer transition-all ${
                  selectedChatId === chat.chat_id ? "bg-cyan-600 text-white" : "text-white hover:bg-teal-600"
                }`}
                onClick={() => onSelectChat(chat)}
              >
                <div className="w-10 h-10 overflow-hidden rounded-lg bg-white">
                  <img
                    src={chat.image_url}
                    alt={chat.event_title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-xl w-[150px] truncate">{chat.event_title}</div>
              </li>
            ))
          ) : (
            <div className="text-white text-xl">No chats yet... <br />Join an event!</div>
          )}
        </ul>
      )}
    </>
  );
}
