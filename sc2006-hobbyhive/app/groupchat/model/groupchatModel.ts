import { createClient } from "@/utils/supabase/client";

export type GroupChatListItem = {
  chat_id: string;
  event_title: string;
  image_url: string;
};

export type MemberRow = {
  user_id: string;
  profiles: { username: string | null } | null;
};

// fetch groupchats based on user
export async function fetchGroupChats(userId: string): Promise<GroupChatListItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("group_chat_members")
    .select(`group_chats:chat_id (
      id,
      events:event_id (
        id,
        title,
        image_url
      )
    )`)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);

  const chats = (data as unknown as any[]).map((item) => {
    const event = item.group_chats?.events;
    return {
      chat_id: item.group_chats?.id,
      event_title: event?.title ?? "Unnamed Event",
      image_url: event?.image_url ?? "/placeholder.png",
    };
  });

  return chats.filter((c: any) => !!c.chat_id);
}
// fetch host id
export async function fetchHostIdByChatId(chatId: string): Promise<string | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("group_chats")
    .select(`id, events(host_id)`)
    .eq("id", chatId)
    .single();

  if (error) throw new Error(error.message);
  return (data as any)?.events?.host_id ?? null;
}

// fetch members
export async function fetchMembers(chatId: string): Promise<MemberRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("group_chat_members")
    .select(`
      user_id,
      profiles:profiles!inner(username)
    `)
    .eq("chat_id", chatId);

  if (error) throw new Error(error.message);

  const rows: MemberRow[] = (data ?? []).map((item: any) => {
    const prof =
      Array.isArray(item.profiles) && item.profiles.length > 0
        ? item.profiles[0]
        : item.profiles ?? null;

    return {
      user_id: String(item.user_id),
      profiles: prof ? { username: prof.username ?? null } : null,
    };
  });

  return rows;
}



// user leaves groupchat
export async function leaveGroup(chatId: string, userId: string): Promise<void> {
  const supabase = createClient();
  
  // First, get the event_id associated with this chat
  const { data: chatData, error: chatError } = await supabase
    .from("group_chats")
    .select("event_id")
    .eq("id", chatId)
    .single();
  
  if (chatError) throw new Error(chatError.message);
  
  // Delete from both tables
  const { error: memberError } = await supabase
    .from("group_chat_members")
    .delete()
    .eq("chat_id", chatId)
    .eq("user_id", userId);

  if (memberError) throw new Error(memberError.message);

  const { error: participantError } = await supabase
    .from("event_participants")
    .delete()
    .eq("event_id", chatData.event_id)
    .eq("user_id", userId);

  if (participantError) throw new Error(participantError.message);
}

// host remove function
export async function removeMember(chatId: string, memberUserId: string): Promise<void> {
  const supabase = createClient();
  
  // First, get the event_id associated with this chat
  const { data: chatData, error: chatError } = await supabase
    .from("group_chats")
    .select("event_id")
    .eq("id", chatId)
    .single();
  
  if (chatError) throw new Error(chatError.message);
  
  // Delete from both tables
  const { error: memberError } = await supabase
    .from("group_chat_members")
    .delete()
    .eq("chat_id", chatId)
    .eq("user_id", memberUserId);

  if (memberError) throw new Error(memberError.message);

  const { error: participantError } = await supabase
    .from("event_participants")
    .delete()
    .eq("event_id", chatData.event_id)
    .eq("user_id", memberUserId);

  if (participantError) throw new Error(participantError.message);
}

