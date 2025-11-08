import { createClient } from "@/utils/supabase/client";

export type MessageRow = {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  profiles?: { username: string | null } | null;
};

//fetch existing messages for chat and username in asc order 
export async function fetchMessages(chatId: string): Promise<MessageRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("messages")
    .select("id, chat_id, sender_id, content, created_at, profiles:sender_id(username)")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  // 👇 Flatten profiles array so TS is happy
  const messages = (data ?? []).map((msg: any) => ({
    ...msg,
    profiles: Array.isArray(msg.profiles) ? msg.profiles[0] : msg.profiles,
  }));

  return messages as MessageRow[];
}


// insert msg
export async function sendMessage(chatId: string, senderId: string, content: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("messages").insert([{ chat_id: chatId, sender_id: senderId, content }]);
  if (error) throw new Error(`${error.message} ${error.details ?? ""} ${error.hint ?? ""}`.trim());
}

/** Realtime subscription for new messages in a chat; returns unsubscribe. */
export function subscribeToMessages(
  chatId: string,
  onMessage: (msg: MessageRow) => void
): () => void {
  const supabase = createClient();

  const channel = supabase
    .channel(`chat_${chatId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages", filter: `chat_id=eq.${chatId}` },
      async (payload) => {
        // Fetch username for the sender (to keep UI consistent)
        const { data: profile } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", payload.new.sender_id)
          .single();

        onMessage({
          ...(payload.new as any),
          profiles: profile ?? null,
        } as MessageRow);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
