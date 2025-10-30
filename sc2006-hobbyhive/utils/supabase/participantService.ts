import { createClient } from './client';

const supabase = createClient();

// Get all events that participant joined
export async function getParticipantEvents() {
  const { data, error } = await supabase
    .from('event_participants')
    .select('events(*)'); // joins with events table
  if (error) {
    console.error('Error loading events:', error);
    return [];
  }

  // Flatten nested structure
  return (data || []).map((p) => p.events);
}

// Get recommended events (based on popularity or category)
export async function getRecommendedEvents() {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('popularity', { ascending: false });
  if (error) console.error('Error getting recommendations:', error);
  return data || [];
}

// Get followed users
export async function getFollowedUsers() {
  try {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return [];

    const { data, error } = await supabase
      .from("follows")
      .select("followed_user_id") // just get the IDs for now
      .eq("follower_id", user.id);

    if (error) {
      console.warn("Follows table error:", error.message);
      return [];
    }

    // If you still want user details, fetch them manually (optional)
    const followedIds = data?.map((f) => f.followed_user_id) || [];
    if (followedIds.length === 0) return [];

    const { data: usersData, error: usersError } = await supabase
      .from("users")
      .select("id, username, avatar")
      .in("id", followedIds);

    if (usersError) {
      console.warn("Users table error:", usersError.message);
      return [];
    }

    return usersData || [];
  } catch (err) {
    console.error("Error in getFollowedUsers():", err);
    return [];
  }
}



//Join event
export async function joinEvent(eventId: string) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    console.error("Failed to get current user:", userError);
    return false;
  }
  const userId = userData.user.id;

  // Prevent duplicates
  const { data: existing } = await supabase
    .from("event_participants")
    .select("*")
    .eq("user_id", userId)
    .eq("event_id", eventId);

  if (existing?.length) {
    console.warn("Already joined!");
    return false;
  }

  const { error } = await supabase
    .from("event_participants")
    .insert([{ user_id: userId, event_id: eventId }]);

  if (error) {
    console.error("Error joining event:", error.message);
    return false;
  }

  console.log(`User ${userId} successfully joined event ${eventId}`);
  return true;
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

// Get all group chats (using events the user joined)
export async function getParticipantGroupChats() {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Error fetching user:", userError);
    return [];
  }

  // Get events the participant joined
  const { data, error } = await supabase
    .from("event_participants")
    .select(`
      event_id,
      events (
        id,
        title,
        image_url
      )
    `)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error loading group chats:", error);
    return [];
  }

  // Create mock group chat list from joined events
  return (data || []).map((p) => ({
    id: p.events?.id,
    name: `${p.events?.title || "Event"} Chat`,
    avatar: p.events?.image_url || "https://i.pravatar.cc/150",
  }));
}

// Get events that the participant has NOT joined yet
export async function getAvailableEvents() {
  const supabase = createClient();

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Failed to get user:", userError);
    return [];
  }

  // Fetch all events the user has already joined
  const { data: joinedData, error: joinedError } = await supabase
    .from("event_participants")
    .select("event_id")
    .eq("user_id", user.id);

  if (joinedError) {
    console.error("Error loading joined events:", joinedError.message);
    return [];
  }

  const joinedIds = joinedData?.map((j) => j.event_id) || [];

  // Fetch all events
  const { data: allEvents, error: allError } = await supabase
    .from("events")
    .select("*");

  if (allError) {
    console.error("Error loading available events:", allError.message);
    return [];
  }

  // Filter out already joined events
  const available = allEvents.filter((event) => !joinedIds.includes(event.id));

  console.log("Available events:", available);
  return available;
}
