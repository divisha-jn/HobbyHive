import { createClient } from "@/utils/supabase/client";

export interface User {
  id: string;
  username: string;
  email: string;
  is_flagged: boolean;
  flag_reason: string | null;
  is_banned: boolean;
  ban_reason: string | null;
  banned_until: string | null;
  created_at: string;
}

export interface UserFilters {
  showFlaggedOnly?: boolean;
  showBannedOnly?: boolean;
}

class UserModel {
  private supabase = createClient();

  /**
   * Fetch users with optional filters
   */
  async fetchUsers(filters?: UserFilters): Promise<User[]> {
    console.log("[UserModel.fetchUsers] Loading users with filters:", filters);

    let query = this.supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (filters?.showFlaggedOnly) {
      query = query.eq("is_flagged", true);
    }

    if (filters?.showBannedOnly) {
      query = query.eq("is_banned", true);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[UserModel.fetchUsers] Error:", error);
      throw new Error(`Failed to fetch users: ${error.message}`);
    }

    console.log("[UserModel.fetchUsers] Loaded", data?.length, "users");
    return data || [];
  }

  /**
   * Search users by username
   */
  async searchUserByUsername(username: string): Promise<User[]> {
    console.log("[UserModel.searchUserByUsername] Searching for:", username);

    const { data, error } = await this.supabase
      .from("profiles")
      .select("*")
      .ilike("username", `%${username}%`);

    if (error) {
      console.error("[UserModel.searchUserByUsername] Error:", error);
      throw new Error(`Failed to search user: ${error.message}`);
    }

    console.log("[UserModel.searchUserByUsername] Found", data?.length, "users");
    return data || [];
  }

  /**
   * Ban a user with optional duration
   */
  async banUser(
    userId: string,
    reason: string,
    bannedUntil: string | null
  ): Promise<void> {
    console.log("[UserModel.banUser] Banning user:", userId);

    const { error } = await this.supabase
      .from("profiles")
      .update({
        is_banned: true,
        ban_reason: reason,
        banned_until: bannedUntil,
      })
      .eq("id", userId);

    if (error) {
      console.error("[UserModel.banUser] Error:", error);
      throw new Error(`Failed to ban user: ${error.message}`);
    }
  }

  /**
   * Unban a user
   */
  async unbanUser(userId: string): Promise<void> {
    console.log("[UserModel.unbanUser] Unbanning user:", userId);

    const { error } = await this.supabase
      .from("profiles")
      .update({
        is_banned: false,
        ban_reason: null,
        banned_until: null,
      })
      .eq("id", userId);

    if (error) {
      console.error("[UserModel.unbanUser] Error:", error);
      throw new Error(`Failed to unban user: ${error.message}`);
    }
  }

  /**
   * Remove flag from a user
   */
  async unflagUser(userId: string): Promise<void> {
    console.log("[UserModel.unflagUser] Unflagging user:", userId);

    const { error } = await this.supabase
      .from("profiles")
      .update({
        is_flagged: false,
        flag_reason: null,
      })
      .eq("id", userId);

    if (error) {
      console.error("[UserModel.unflagUser] Error:", error);
      throw new Error(`Failed to unflag user: ${error.message}`);
    }
  }
}

export default UserModel;
