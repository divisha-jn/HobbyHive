'use client';
import React, { useEffect, useState } from 'react';
import ParticipantEvents from './ParticipantEvents';
import RecommendedEvents from './RecommendedEvents';
import FollowedUsers from './FollowedUsers';
import { getParticipantEvents, getRecommendedEvents } from '@/utils/supabase/participantService';

export default function ParticipantPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      const joinedEvents = await getParticipantEvents();
      const recEvents = await getRecommendedEvents();
      setEvents(joinedEvents);
      setRecommendations(recEvents);
    }
    loadData();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Participant Dashboard</h1>
      <RecommendedEvents events={recommendations} />
      <ParticipantEvents events={events} />
      <FollowedUsers />
    </div>
  );
}

