"use client"
import React from 'react'
import { createClient } from "../../utils/supabase/client";
import Link from "next/link";
import Navbar from "../components/Navbar";
import ListingCard from '../components/ListingCard';
import { useState } from 'react';


const page = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<string[]>([]);

  const handleSend = () => {
    setMessages([...messages, input]);
    setInput('');
  }
  return (
    <div className="h-screen flex flex-col p-2">
      {/*header*/}
      <div className="flex flex-row px-2 ">
          <span><Navbar/></span>

          <div className="text-5xl flex-1 text-center text-cyan-300">HobbyHive</div>
            <div className="w-[40px]"/> 

      </div>
      {/*chat layout*/}
      <div className="Chat p-0 gap-4 flex flex-row flex-1">
        {/*chatgroups*/}
        <ul className="list bg-base-100 rounded-box shadow-md p-5 w-1/4">
    
    
          <li className="list-row  hover:bg-base-200">
            <div><img className="size-10 rounded-box" src="https://img.daisyui.com/images/profile/demo/1@94.webp"/></div>
              <p className="text-xl">Group 1</p>
          </li>
          
          <li className="list-row  hover:bg-base-200">
            <div><img className="size-10 rounded-box" src="https://img.daisyui.com/images/profile/demo/4@94.webp"/></div>
              <p className="text-xl">Group 2</p>
          </li>
          
          <li className="list-row  hover:bg-base-200">
            <div><img className="size-10 rounded-box" src="https://img.daisyui.com/images/profile/demo/3@94.webp"/></div>
              <p className="text-xl">Group 3</p>
          </li>
        
        </ul>
        {/*chat room*/}

        <div className="Chatroom border-1 border-base-300 p-2 flex flex-col flex-1 rounded-2xl">
          <span className="flex-1 p-2 overflow-y-auto space-y-8">
            {messages.length > 0?(
              messages.map((msg,idx) => (
              <p key={idx} className="">{msg}</p>
            ))
            ):(
              <p className="text-gray-500 text-center">No messages yet...</p>

            )}
          </span>
        

          <div className="flex p-2 gap-4 items-end w-full">
              <input 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                onKeyDown={(e) =>{
                  if(e.key ==="Enter") {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder ="Enter your message..."
                className="input input-bordered w-full"/>
              <span className="">
                  <button 
                  onClick={handleSend}
                  className="btn btn-accent rounded-xl font-bold">send</button>
              </span>
            </div>

          </div>
          
        </div>

    </div>
  )
}

export default page;
