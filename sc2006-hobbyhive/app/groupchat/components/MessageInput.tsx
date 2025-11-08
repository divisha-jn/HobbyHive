"use client";

import React, { useState } from "react";

type Props = {
  onSend: (text: string) => Promise<void> | void;
};

export default function MessageInput({ onSend }: Props) {
  const [input, setInput] = useState("");

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    await Promise.resolve(onSend(text));
    setInput("");
  };

  return (
  <div className="flex p-2 gap-4 items-end w-full text-black border-t border-gray-300">
    <input
      value={input}
      onChange={(e) => setInput(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          void send();
        }
      }}
      placeholder="Enter your message..."
      className="input input-bordered w-full"
    />
    <button onClick={send} className="btn btn-accent rounded-xl font-bold">
      send
    </button>
  </div>
);
}

