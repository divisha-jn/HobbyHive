import { createClient } from "@/utils/supabase/client";

export interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  time?: string;
  location: string;
  image_url?: string;
  host_id: string;
  status: string;
  created_at: string;
}

export interface Flag {
  id: string;
  reason: string;
  user_id: string;
  created_at: string;
  flagged_by_username: string;
}

export interface FlaggedEvent extends Event {
  hostName: string;
  flagCount: number;
  flags: Flag[];
}

class EventModel {
  private supabase = createClient();

  /**
   * Fetch all pending events awaiting approval
   */
  async fetchPendingEvents(): Promise<Event[]> {
    console.log("[EventModel.fetchPendingEvents] Loading pending events...");
    
    const { data, error } = await this.supabase
      .from("events")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[EventModel.fetchPendingEvents] Error:", error);
      throw new Error(`Failed to fetch pending events: ${error.message}`);
    }

    console.log("[EventModel.fetchPendingEvents] Loaded", data?.length, "events");
    return data || [];
  }

  /**
   * Fetch all flagged events with flag details and host info
   */
  async fetchFlaggedEvents(): Promise<FlaggedEvent[]> {
    console.log("[EventModel.fetchFlaggedEvents] Loading flagged events...");

    // Get all unprocessed flags with event details
    const { data: flagData, error: flagError } = await this.supabase
      .from("event_flags")
      .select(
        `
        id,
        reason,
        user_id,
        created_at,
        event_id,
        events (
          id,
          title,
          description,
          date,
          time,
          location,
          image_url,
          host_id,
          status,
          category
        )
      `
      )
      .is("admin_action", null)
      .order("created_at", { ascending: false });

    if (flagError) {
      console.error("[EventModel.fetchFlaggedEvents] Error:", flagError);
      throw new Error(`Failed to fetch flagged events: ${flagError.message}`);
    }

    if (!flagData || flagData.length === 0) {
      console.log("[EventModel.fetchFlaggedEvents] No flagged events found");
      return [];
    }

    // Group flags by event_id
    const eventMap = new Map<string, FlaggedEvent>();

    flagData.forEach((flag: any) => {
      const event = flag.events;
      if (!event) return;

      if (!eventMap.has(event.id)) {
        eventMap.set(event.id, {
          id: event.id,
          title: event.title,
          description: event.description,
          date: event.date,
          time: event.time,
          location: event.location,
          image_url: event.image_url,
          host_id: event.host_id,
          hostName: "",
          status: event.status,
          category: event.category,
          created_at: event.created_at,
          flagCount: 0,
          flags: [],
        });
      }

      const eventEntry = eventMap.get(event.id)!;
      eventEntry.flagCount += 1;
      eventEntry.flags.push({
        id: flag.id,
        reason: flag.reason,
        user_id: flag.user_id,
        created_at: flag.created_at,
        flagged_by_username: "",
      });
    });

    // Get host names and flagger usernames
    const hostIds = Array.from(eventMap.values()).map((e) => e.host_id);
    const userIds = Array.from(eventMap.values())
      .flatMap((e) => e.flags.map((f) => f.user_id))
      .filter((id, index, self) => self.indexOf(id) === index);

    const { data: profiles, error: profileError } = await this.supabase
      .from("profiles")
      .select("id, username")
      .in("id", [...hostIds, ...userIds]);

    if (profileError) {
      console.error("[EventModel.fetchFlaggedEvents] Profile error:", profileError);
    }

    // Apply host names and flagger usernames
    const eventsWithNames = Array.from(eventMap.values())
      .map((event) => ({
        ...event,
        hostName:
          profiles?.find((p) => p.id === event.host_id)?.username || "Unknown",
        flags: event.flags.map((flag) => ({
          ...flag,
          flagged_by_username:
            profiles?.find((p) => p.id === flag.user_id)?.username || "Unknown",
        })),
      }))
      .sort((a, b) => b.flagCount - a.flagCount);

    console.log("[EventModel.fetchFlaggedEvents] Loaded", eventsWithNames.length, "flagged events");
    return eventsWithNames;
  }

  /**
   * Update event status (approved/rejected)
   */
  async updateEventStatus(
    eventId: string,
    status: "approved" | "rejected",
    rejectionReason?: string
  ): Promise<void> {
    console.log("[EventModel.updateEventStatus] Updating event:", eventId, "to", status);

    const updateData: any = { status };
    if (status === "rejected" && rejectionReason) {
      updateData.rejection_reason = rejectionReason;
    }

    const { error } = await this.supabase
      .from("events")
      .update(updateData)
      .eq("id", eventId);

    if (error) {
      console.error("[EventModel.updateEventStatus] Error:", error);
      throw new Error(`Failed to update event status: ${error.message}`);
    }
  }

  /**
   * Get event host ID
   */
  async getEventHostId(eventId: string): Promise<string> {
    const { data, error } = await this.supabase
      .from("events")
      .select("host_id")
      .eq("id", eventId)
      .single();

    if (error || !data) {
      throw new Error(`Failed to fetch event host: ${error?.message}`);
    }

    return data.host_id;
  }

  /**
   * Add host as participant to approved event
   */
  async addHostAsParticipant(eventId: string, hostId: string): Promise<void> {
    console.log("[EventModel.addHostAsParticipant] Adding host to event:", eventId);

    const { error } = await this.supabase
      .from("event_participants")
      .insert([{ event_id: eventId, user_id: hostId }]);

    if (error) {
      console.error("[EventModel.addHostAsParticipant] Error:", error);
      throw new Error(`Failed to add host as participant: ${error.message}`);
    }
  }

  /**
   * Delete all participants of an event
   */
  async deleteEventParticipants(eventId: string): Promise<void> {
    console.log("[EventModel.deleteEventParticipants] Deleting participants for:", eventId);

    const { error } = await this.supabase
      .from("event_participants")
      .delete()
      .eq("event_id", eventId);

    if (error) {
      console.error("[EventModel.deleteEventParticipants] Error:", error);
      throw new Error(`Failed to delete event participants: ${error.message}`);
    }
  }

  /**
   * Delete an event
   */
  async deleteEvent(eventId: string): Promise<void> {
    console.log("[EventModel.deleteEvent] Deleting event:", eventId);

    const { error } = await this.supabase
      .from("events")
      .delete()
      .eq("id", eventId);

    if (error) {
      console.error("[EventModel.deleteEvent] Error:", error);
      throw new Error(`Failed to delete event: ${error.message}`);
    }
  }
}

export default EventModel;
