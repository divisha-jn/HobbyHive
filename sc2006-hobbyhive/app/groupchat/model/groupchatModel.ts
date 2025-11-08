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
    .select("user_id, profiles:user_id(username)")
    .eq("chat_id", chatId);

  if (error) throw new Error(error.message);

  const rows: MemberRow[] = (data ?? []).map((item: any) => {
    const profArr = Array.isArray(item.profiles) ? item.profiles : [];
    const first = profArr[0] ?? null;

    return {
      user_id: String(item.user_id),
      profiles: first ? { username: first.username ?? null } : null,
    };
  });

  return rows;
}

// user leaves groupchat
export async function leaveGroup(chatId: string, userId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("group_chat_members")
    .delete()
    .eq("chat_id", chatId)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
}

// host remove function
export async function removeMember(chatId: string, memberUserId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("group_chat_members")
    .delete()
    .eq("chat_id", chatId)
    .eq("user_id", memberUserId);

  if (error) throw new Error(error.message);
}
