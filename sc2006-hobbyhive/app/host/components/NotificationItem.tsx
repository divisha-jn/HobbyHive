"use client";
import React from "react";

interface Notification {
  id: number;
  text: string;
  time: string;
}

interface NotificationItemProps {
  notification: Notification;
}

export default function NotificationItem({ notification }: NotificationItemProps) {
  return (
    <li className="border p-3 rounded-md shadow-sm bg-gray-100">
      <p>{notification.text}</p>
      <span className="text-sm text-gray-500">{notification.time}</span>
    </li>
  );
}
