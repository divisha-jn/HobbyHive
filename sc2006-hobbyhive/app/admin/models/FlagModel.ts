import { createClient } from "@/utils/supabase/client";

export type AdminAction = "removed_flag" | "deleted_event" | null;

class FlagModel {
  private supabase = createClient();

  /**
   * Update flag with admin action
   */
  async updateFlagStatus(
    flagId: string,
    adminAction: AdminAction,
    adminId: string
  ): Promise<void> {
    console.log("[FlagModel.updateFlagStatus] Updating flag:", flagId, "action:", adminAction);

    const { error } = await this.supabase
      .from("event_flags")
      .update({
        admin_action: adminAction,
        admin_id: adminId,
        action_taken_at: new Date().toISOString(),
      })
      .eq("id", flagId);

    if (error) {
      console.error("[FlagModel.updateFlagStatus] Error:", error);
      throw new Error(`Failed to update flag status: ${error.message}`);
    }
  }

  /**
   * Mark all unprocessed flags for an event as handled
   */
  async markEventFlagsAsHandled(
    eventId: string,
    adminAction: AdminAction,
    adminId: string
  ): Promise<void> {
    console.log(
      "[FlagModel.markEventFlagsAsHandled] Marking flags for event:",
      eventId,
      "action:",
      adminAction
    );

    const { error } = await this.supabase
      .from("event_flags")
      .update({
        admin_action: adminAction,
        admin_id: adminId,
        action_taken_at: new Date().toISOString(),
      })
      .eq("event_id", eventId)
      .is("admin_action", null);

    if (error) {
      console.error("[FlagModel.markEventFlagsAsHandled] Error:", error);
      throw new Error(`Failed to mark event flags: ${error.message}`);
    }
  }
}

export default FlagModel;
