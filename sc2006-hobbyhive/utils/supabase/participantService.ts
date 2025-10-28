import { createClient } from './client';

const supabase = createClient();

// Get all events that participant joined
export async function getParticipantEvents() {
  const { data, error } = await supabase
    .from('event_participants')
    .select('events(*)'); // joins with events table
  if (error) console.error('Error loading events:', error);
  return data || [];
}

// Get recommended events (based on popularity or category)
export async function getRecommendedEvents(id?: string) {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('popularity', { ascending: false });
  if (error) console.error('Error getting recommendations:', error);
  return data || [];
}

// Get followed users
export async function getFollowedUsers() {
  const { data, error } = await supabase
    .from('follows')
    .select('followed_user_id, users(username, avatar)')
    .eq('follower_id', (await supabase.auth.getUser()).data.user?.id);
  if (error) console.error('Error getting followed users:', error);
  
  // Flatten the data so users is an object, not an array
  return (data || []).map(follow => ({
    followed_user_id: follow.followed_user_id,
    users: Array.isArray(follow.users) ? follow.users[0] : follow.users
  }));
}

// Join event
export async function joinEvent(eventId: string) {
  const user = (await supabase.auth.getUser()).data.user;
  const { error } = await supabase
    .from('participants')
    .insert([{ user_id: user?.id, event_id: eventId }]);
  if (error) console.error('Error joining event:', error);
}

// Leave event
export async function leaveEvent(eventId: string) {
  const user = (await supabase.auth.getUser()).data.user;
  const { error } = await supabase
    .from('participants')
    .delete()
    .eq('user_id', user?.id)
    .eq('event_id', eventId);
  if (error) console.error('Error leaving event:', error);
}
