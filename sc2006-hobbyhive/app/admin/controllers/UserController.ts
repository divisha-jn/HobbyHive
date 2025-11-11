import UserModel, { User, UserFilters } from "../models/UserModel";

class UserController {
  private userModel = new UserModel();

  /**
   * Load users with optional filters
   */
  async loadUsers(filters?: UserFilters): Promise<User[]> {
    try {
      return await this.userModel.fetchUsers(filters);
    } catch (error) {
      console.error("[UserController.loadUsers] Error:", error);
      throw error;
    }
  }

  /**
   * Search for users by username
   */
  async searchUsers(username: string): Promise<User[]> {
    try {
      if (!username || username.trim() === "") {
        // If search is empty, return all users
        return await this.userModel.fetchUsers();
      }
      return await this.userModel.searchUserByUsername(username);
    } catch (error) {
      console.error("[UserController.searchUsers] Error:", error);
      throw error;
    }
  }

  /**
   * Ban a user with optional duration
   */
  async banUser(
    userId: string,
    reason: string,
    durationDays?: number
  ): Promise<void> {
    console.log("[UserController.banUser] Banning user:", userId);

    if (!reason || reason.trim() === "") {
      throw new Error("Ban reason is required");
    }

    try {
      const bannedUntil = durationDays
        ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString()
        : null;

      await this.userModel.banUser(userId, reason, bannedUntil);
      console.log("[UserController.banUser] User banned successfully");
    } catch (error) {
      console.error("[UserController.banUser] Error:", error);
      throw error;
    }
  }

  /**
   * Unban a user
   */
  async unbanUser(userId: string): Promise<void> {
    console.log("[UserController.unbanUser] Unbanning user:", userId);

    try {
      await this.userModel.unbanUser(userId);
      console.log("[UserController.unbanUser] User unbanned successfully");
    } catch (error) {
      console.error("[UserController.unbanUser] Error:", error);
      throw error;
    }
  }

  /**
   * Remove flag from a user
   */
  async unflagUser(userId: string): Promise<void> {
    console.log("[UserController.unflagUser] Unflagging user:", userId);

    try {
      await this.userModel.unflagUser(userId);
      console.log("[UserController.unflagUser] User unflagged successfully");
    } catch (error) {
      console.error("[UserController.unflagUser] Error:", error);
      throw error;
    }
  }

  /**
   * Format ban duration for display
   */
  formatBanDuration(bannedUntil: string | null): string {
    if (!bannedUntil) return "Permanent";

    const banDate = new Date(bannedUntil);
    const now = new Date();
    const daysLeft = Math.ceil(
      (banDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysLeft <= 0) return "Expired";
    return `${daysLeft} day${daysLeft !== 1 ? "s" : ""} remaining`;
  }
}

export default UserController;
