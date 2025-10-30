'use client'
import Link from "next/link";
import React from 'react'

const Navbar = () => {
  return (
    <div className="navbar">
        <div className="flex-1">
            <details className="dropdown">
                <summary className="btn m-1 rounded-xl border-1 text-teal-500 border-teal-500">☰</summary>
                    <ul className="menu dropdown-content bg-base-100 rounded-box z-2 w-52 p-2 shadow-sm ">
                        <li><Link href="/events">📅 Events</Link></li>
                        <li><Link href="/MyEvents">👤 My Events</Link></li>
                        <li><Link href="/host/CreateEvent">➕ Create Event!</Link></li>
                        <li><Link href="/groupchat">💬 Groupchats</Link></li>
                    </ul>
            </details>
        </div>
    </div>
  );
};

export default Navbar;
