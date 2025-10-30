'use client';
import React, { useEffect, useState } from 'react';
import ParticipantEvents from './ParticipantEvents';
import RecommendedEvents from './RecommendedEvents';
import FollowedUsers from './FollowedUsers/FollowedUsers';
import { getParticipantEvents, joinEvent, getAvailableEvents } from '@/utils/supabase/participantService';

export default function ParticipantPage() {
  const [joinedEvents, setJoinedEvents] = useState<any[]>([]);
  const [availableEvents, setAvailableEvents] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      const joined = await getParticipantEvents();
      const available = await getAvailableEvents();
      setJoinedEvents(joined);
      setAvailableEvents(available);
    }
    loadData();
  }, []);

  const handleJoin = (eventId: string) => {
    const joinedEvent = availableEvents.find(e => e.id === eventId);
    if (joinedEvent) {
      setJoinedEvents(prev => [...prev, joinedEvent]);
      setAvailableEvents(prev => prev.filter(e => e.id !== eventId));
    }
  };

  return (
    <div className="p-6 pb-32"> {/* extra bottom padding to make space for fixed join box */}
      <h1 className="text-3xl font-bold mb-4">Participant Dashboard</h1>

      <ParticipantEvents events={joinedEvents} />
      <FollowedUsers />

      <RecommendedEvents
        events={availableEvents}
        joinedEventIds={joinedEvents.map(e => e.id)}
        onJoin={handleJoin}
      />
    </div>
  );
}

