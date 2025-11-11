import FlagModel from "../models/FlagModel";

class FlagController {
  private flagModel = new FlagModel();

  /**
   * Clear a single flag (mark as removed)
   */
  async clearFlag(flagId: string, adminId: string): Promise<void> {
    console.log("[FlagController.clearFlag] Clearing flag:", flagId);

    try {
      await this.flagModel.updateFlagStatus(flagId, "removed_flag", adminId);
      console.log("[FlagController.clearFlag] Flag cleared successfully");
    } catch (error) {
      console.error("[FlagController.clearFlag] Error:", error);
      throw error;
    }
  }
}

export default FlagController;
