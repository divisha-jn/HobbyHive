import { createClient } from "@/utils/supabase/client";

export interface EventData {
  id?: string;
  title: string;
  date: string;
  time: string;
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  nearest_mrt_station?: string | null;
  nearest_mrt_distance?: number | null;
  description: string;
  capacity: number;
  category: string;
  skill_level: string;
  image_url?: string;
  host_id?: string;
}

export class EventModel {
  private supabase = createClient();

  /**
   * Fetch a single event by ID
   */
  async fetchEventById(eventId: string) {
    const { data, error } = await this.supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .single();

    return { data, error };
  }

  /**
   * Create a new event
   */
  async createEvent(eventData: EventData, userId: string) {
    const { error } = await this.supabase.from("events").insert([
      {
        title: eventData.title,
        date: eventData.date,
        time: eventData.time,
        location: eventData.location,
        latitude: eventData.latitude,
        longitude: eventData.longitude,
        nearest_mrt_station: eventData.nearest_mrt_station,
        nearest_mrt_distance: eventData.nearest_mrt_distance,
        description: eventData.description,
        capacity: eventData.capacity,
        category: eventData.category,
        skill_level: eventData.skill_level,
        image_url: eventData.image_url,
        host_id: userId,
      },
    ]);

    return { error };
  }

  /**
   * Update an existing event
   */
  async updateEvent(eventId: string, eventData: EventData) {
    const { error } = await this.supabase
      .from("events")
      .update({
        title: eventData.title,
        date: eventData.date,
        time: eventData.time,
        location: eventData.location,
        latitude: eventData.latitude,
        longitude: eventData.longitude,
        nearest_mrt_station: eventData.nearest_mrt_station,
        nearest_mrt_distance: eventData.nearest_mrt_distance,
        description: eventData.description,
        capacity: eventData.capacity,
        category: eventData.category,
        skill_level: eventData.skill_level,
        image_url: eventData.image_url,
      })
      .eq("id", eventId);

    return { error };
  }

  /**
   * Upload event image to Supabase Storage
   */
  async uploadEventImage(file: File, userId: string, eventTitle: string) {
    const fileExt = file.name.split(".").pop();
    const uniqueName = `${eventTitle.replace(/\s+/g, "_")}_${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${uniqueName}`;

    const { error: uploadError } = await this.supabase.storage
      .from("event-photo")
      .upload(filePath, file);

    if (uploadError) {
      return { imageUrl: null, error: uploadError };
    }

    const { data: publicUrlData } = this.supabase.storage
      .from("event-photo")
      .getPublicUrl(filePath);

    return { imageUrl: publicUrlData.publicUrl, error: null };
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser() {
    const { data: { user }, error } = await this.supabase.auth.getUser();
    return { user, error };
  }

  /**
   * Cancel an event (set status to cancelled)
   */
  async cancelEvent(eventId: string) {
    const { error } = await this.supabase
      .from("events")
      .update({ status: "cancelled" })
      .eq("id", eventId);

    return { error };
  }
}
