import { EventModel, EventData } from "@/app/host/models/EventModel";
import { findNearestMRT } from "@/app/utils/calculateNearestMRT";


interface ValidationResult {
  isValid: boolean;
  errors: { [key: string]: boolean };
  message?: string;
}


export class EventController {
  private eventModel: EventModel;


  constructor(eventModel: EventModel) {
    this.eventModel = eventModel;
  }


  /**
   * Validate event form data
   */
  validateEventForm(formData: {
    title: string;
    category: string;
    skillLevel: string;
    date: string;
    time: string;
    location: string;
    capacity: string;
  }): ValidationResult {
    const errors: { [key: string]: boolean } = {};
    let message = "";


    // Required field validation
    if (!formData.title.trim()) errors.title = true;
    if (!formData.category) errors.category = true;
    if (!formData.skillLevel) errors.skillLevel = true;
    if (!formData.date) errors.date = true;
    if (!formData.time) errors.time = true;
    if (!formData.location.trim()) errors.location = true;
    if (!formData.capacity || parseInt(formData.capacity) <= 0) errors.capacity = true;


    // Future date/time validation with 2-day minimum
    if (formData.date && formData.time) {
      const selectedDateTime = new Date(`${formData.date}T${formData.time}`);
      const now = new Date();
      const twoDaysFromNow = new Date();
      twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
      twoDaysFromNow.setHours(0, 0, 0, 0); // Reset to start of day
      
      const selectedDateOnly = new Date(formData.date);
      selectedDateOnly.setHours(0, 0, 0, 0);

      if (selectedDateTime <= now) {
        errors.date = true;
        errors.time = true;
        message = "Please select a future date and time.";
      } else if (selectedDateOnly < twoDaysFromNow) {
        errors.date = true;
        message = "Events must be scheduled at least 2 days in advance.";
      }
    }


    // Set default message if fields are missing
    if (Object.keys(errors).length > 0 && !message) {
      message = "Please fill in all required fields marked with *";
    }


    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      message,
    };
  }


  /**
   * Calculate nearest MRT station for given coordinates
   */
  async calculateNearestMRT(lat: number, lng: number) {
    try {
      const mrtInfo = await findNearestMRT(lat, lng);
      return mrtInfo;
    } catch (error) {
      console.error("Error finding nearest MRT:", error);
      return null;
    }
  }


  /**
   * Create a new event
   */
  async createEvent(
    formData: {
      title: string;
      category: string;
      skillLevel: string;
      date: string;
      time: string;
      location: string;
      capacity: string;
      description: string;
      latitude: number | null;
      longitude: number | null;
      nearestMRT: string | null;
      nearestMRTDistance: number | null;
    },
    imageFile: File | null
  ) {
    // Validate form
    const validation = this.validateEventForm(formData);
    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors,
        message: validation.message,
      };
    }


    // Get current user
    const { user, error: userError } = await this.eventModel.getCurrentUser();
    if (userError || !user) {
      return {
        success: false,
        errors: {},
        message: "Please log in first.",
      };
    }


    // Handle image upload
    let imageUrl = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e";
    if (imageFile) {
      const { imageUrl: uploadedUrl, error: uploadError } =
        await this.eventModel.uploadEventImage(imageFile, user.id, formData.title);


      if (uploadError) {
        return {
          success: false,
          errors: {},
          message: "Error uploading image: " + uploadError.message,
        };
      }


      if (uploadedUrl) imageUrl = uploadedUrl;
    }


    // Create event
    const eventData: EventData = {
      title: formData.title,
      date: formData.date,
      time: formData.time,
      location: formData.location,
      latitude: formData.latitude,
      longitude: formData.longitude,
      nearest_mrt_station: formData.nearestMRT,
      nearest_mrt_distance: formData.nearestMRTDistance,
      description: formData.description,
      capacity: parseInt(formData.capacity),
      category: formData.category,
      skill_level: formData.skillLevel,
      image_url: imageUrl,
    };


    const { error } = await this.eventModel.createEvent(eventData, user.id);


    if (error) {
      return {
        success: false,
        errors: {},
        message: "Error creating event: " + error.message,
      };
    }


    return {
      success: true,
      errors: {},
      message: "Event created successfully!",
    };
  }


  /**
   * Update an existing event
   */
  async updateEvent(
    eventId: string,
    formData: {
      title: string;
      category: string;
      skillLevel: string;
      date: string;
      time: string;
      location: string;
      capacity: string;
      description: string;
      latitude: number | null;
      longitude: number | null;
      nearestMRT: string | null;
      nearestMRTDistance: number | null;
    },
    imageFile: File | null,
    existingImageUrl?: string
  ) {
    // Validate form
    const validation = this.validateEventForm(formData);
    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors,
        message: validation.message,
      };
    }


    // Get current user
    const { user, error: userError } = await this.eventModel.getCurrentUser();
    if (userError || !user) {
      return {
        success: false,
        errors: {},
        message: "Please log in first.",
      };
    }


    // Handle image upload
    let imageUrl = existingImageUrl || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e";
    if (imageFile) {
      const { imageUrl: uploadedUrl, error: uploadError } =
        await this.eventModel.uploadEventImage(imageFile, user.id, formData.title);


      if (uploadError) {
        return {
          success: false,
          errors: {},
          message: "Error uploading image: " + uploadError.message,
        };
      }


      if (uploadedUrl) imageUrl = uploadedUrl;
    }


    // Update event
    const eventData: EventData = {
      title: formData.title,
      date: formData.date,
      time: formData.time,
      location: formData.location,
      latitude: formData.latitude,
      longitude: formData.longitude,
      nearest_mrt_station: formData.nearestMRT,
      nearest_mrt_distance: formData.nearestMRTDistance,
      description: formData.description,
      capacity: parseInt(formData.capacity),
      category: formData.category,
      skill_level: formData.skillLevel,
      image_url: imageUrl,
    };


    const { error } = await this.eventModel.updateEvent(eventId, eventData);


    if (error) {
      return {
        success: false,
        errors: {},
        message: "Error updating event: " + error.message,
      };
    }


    return {
      success: true,
      errors: {},
      message: "Event updated successfully!",
    };
  }


  /**
   * Fetch event by ID
   */
  async fetchEventById(eventId: string) {
    const { data, error } = await this.eventModel.fetchEventById(eventId);
    return { data, error };
  }


  /**
   * Cancel an event
   */
  async cancelEvent(eventId: string) {
    const { error } = await this.eventModel.cancelEvent(eventId);
    return { success: !error, error };
  }
}
