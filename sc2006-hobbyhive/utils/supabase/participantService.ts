import { createClient } from './client';
const supabase = createClient();

// Get all events user has joined
export async function getParticipantEvents(userId?: string) {
  if (!userId) {
    const { data: userData } = await supabase.auth.getUser();
    userId = userData?.user?.id;
  }
  if (!userId) return [];

  const { data, error } = await supabase
    .from('event_participants')
    .select('events(*)')
    .eq('user_id', userId);

  if (error) {
    console.error('Error loading participant events:', error);
    return [];
  }

  return (data || []).map((p) => p.events);
}

// Recommended events
export async function getRecommendedEvents() {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'approved')
    .order('popularity', { ascending: false });

  if (error) {
    console.error('Error getting recommendations:', error);
    return [];
  }

  return data || [];
}

//  Followed users (safe fallback)
export async function getFollowedUsers() {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) return [];

  const { data, error } = await supabase
    .from('follows')
    .select('followed_user_id')
    .eq('follower_id', user.id);

  if (error) return [];

  const ids = data.map((f) => f.followed_user_id);
  if (!ids.length) return [];

  const { data: users } = await supabase
    .from('profiles')
    .select('id, username, profile_picture')
    .in('id', ids);

  return users || [];
}

// Join event
export async function joinEvent(eventId: string) {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) return false;

  const { data: existing } = await supabase
    .from('event_participants')
    .select('*')
    .eq('user_id', user.id)
    .eq('event_id', eventId);

  if (existing?.length) {
    console.warn('Already joined event');
    return false;
  }

  const { error } = await supabase
    .from('event_participants')
    .insert([{ user_id: user.id, event_id: eventId }]);

  if (error) {
    console.error('Error joining event:', error.message);
    return false;
  }

  console.log(` Joined event ${eventId}`);
  return true;
}

// Leave event
export async function leaveEvent(eventId: string) {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) return false;

  const { error } = await supabase
    .from('event_participants')
    .delete()
    .eq('user_id', user.id)
    .eq('event_id', eventId);

  if (error) {
    console.error('Error leaving event:', error);
    return false;
  }

  return true;
}
