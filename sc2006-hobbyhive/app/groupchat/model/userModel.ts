import { createClient } from "@/utils/supabase/client";

export async function getCurrentUserId(): Promise<string | null> {
    const supabase = createClient();
    const {data} = await supabase.auth.getUser();
    return data.user?.id ?? null;
}