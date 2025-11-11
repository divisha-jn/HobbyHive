import EventModel, { Event, FlaggedEvent } from "../models/EventModel";
import FlagModel from "../models/FlagModel";

class EventController {
  private eventModel = new EventModel();
  private flagModel = new FlagModel();

  /**
   * Load all pending events
   */
  async loadPendingEvents(): Promise<Event[]> {
    try {
      return await this.eventModel.fetchPendingEvents();
    } catch (error) {
      console.error("[EventController.loadPendingEvents] Error:", error);
      throw error;
    }
  }

  /**
   * Load all flagged events with details
   */
  async loadFlaggedEvents(): Promise<FlaggedEvent[]> {
    try {
      return await this.eventModel.fetchFlaggedEvents();
    } catch (error) {
      console.error("[EventController.loadFlaggedEvents] Error:", error);
      throw error;
    }
  }

  /**
   * Approve an event and add host as participant
   */
  async approveEvent(eventId: string): Promise<void> {
    console.log("[EventController.approveEvent] Approving event:", eventId);

    try {
      // Get host ID first
      const hostId = await this.eventModel.getEventHostId(eventId);

      // Update event status to approved
      await this.eventModel.updateEventStatus(eventId, "approved");

      // Add host as participant
      await this.eventModel.addHostAsParticipant(eventId, hostId);

      console.log("[EventController.approveEvent] Event approved successfully");
    } catch (error) {
      console.error("[EventController.approveEvent] Error:", error);
      throw error;
    }
  }

  /**
   * Reject an event with reason
   */
  async rejectEvent(eventId: string, reason: string): Promise<void> {
    console.log("[EventController.rejectEvent] Rejecting event:", eventId);

    if (!reason || reason.trim() === "") {
      throw new Error("Rejection reason is required");
    }

    try {
      await this.eventModel.updateEventStatus(eventId, "rejected", reason);
      console.log("[EventController.rejectEvent] Event rejected successfully");
    } catch (error) {
      console.error("[EventController.rejectEvent] Error:", error);
      throw error;
    }
  }

  /**
   * Delete an event completely (used for flagged events)
   */
  async deleteEvent(eventId: string, adminId: string): Promise<void> {
    console.log("[EventController.deleteEvent] Deleting event:", eventId);

    try {
      // Step 1: Mark all unprocessed flags as 'deleted_event'
      await this.flagModel.markEventFlagsAsHandled(
        eventId,
        "deleted_event",
        adminId
      );

      // Step 2: Delete all participants
      await this.eventModel.deleteEventParticipants(eventId);

      // Step 3: Delete the event
      await this.eventModel.deleteEvent(eventId);

      console.log("[EventController.deleteEvent] Event deleted successfully");
    } catch (error) {
      console.error("[EventController.deleteEvent] Error:", error);
      throw error;
    }
  }
}

export default EventController;
