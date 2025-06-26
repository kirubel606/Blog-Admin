// src/services/eventService.js
import axiosInstance from "../../api"  // adjust path if needed

export const eventService = {
  // Get all event articles
  async getAllevent() {
    // GET {API_BASE_URL}/event/all/
    const { data } = await axiosInstance.get("/events/")
    // if data.results.result exists, return that
    if (data.results?.result) return data.results.result
    // otherwise if array, return it
    if (Array.isArray(data)) return data
    // otherwise return data.results or empty
    return data.results || []
  },

  // Get single event article detail
  async geteventDetail(eventId) {
    // GET {API_BASE_URL}/event/event/:id/
    const { data } = await axiosInstance.get(`/events/${eventId}/`)
    return data
  },

// Create new event
async createEvent(formData) {
    const payload = new FormData();
  
    payload.append("title", formData.title);
    payload.append("title_am", formData.title_am);
    payload.append("location", formData.location);
    payload.append("location_am", formData.location_am);
    payload.append("description", formData.description);
    payload.append("description_am", formData.description_am);
    payload.append("venue", formData.venue);
    payload.append("venue_am", formData.venue_am);
    payload.append("video_link", formData.video_link);
    payload.append("category", formData.category);
    payload.append("is_live", formData.is_live); // boolean
    payload.append("type", formData.type);       // 'conference' | 'webinar' | 'workshop'
    payload.append("status", formData.status);   // 'upcoming' | 'cancelled'
  
    // Append image only if it's a file
    if (formData.image instanceof File) {
      payload.append("image", formData.image);
    }
  
    // Optional: only if timestamp is provided manually
    if (formData.timestamp) {
      payload.append("timestamp", formData.timestamp);
    }
  
    const { data } = await axiosInstance.post("/events/", payload);
    return data;
  },  

// Update existing event
async updateEvent(eventId, formData) {
    const payload = new FormData();
  
    payload.append("title", formData.title);
    payload.append("title_am", formData.title_am);
    payload.append("location", formData.location);
    payload.append("location_am", formData.location_am);
    payload.append("description", formData.description);
    payload.append("description_am", formData.description_am);
    payload.append("venue", formData.venue);
    payload.append("venue_am", formData.venue_am);
    payload.append("video_link", formData.video_link);
    payload.append("category", formData.category);
    payload.append("is_live", formData.is_live); // should be true/false
    payload.append("type", formData.type);       // 'conference', 'webinar', or 'workshop'
    payload.append("status", formData.status);   // 'upcoming' or 'cancelled'
  
    // Only append if it's a new image file
    if (formData.image instanceof File) {
      payload.append("image", formData.image);
    }
  
    // Optional: if backend allows sending timestamp manually
    if (formData.timestamp) {
      payload.append("timestamp", formData.timestamp);
    }
  
    const { data } = await axiosInstance.put(
      `/events/${eventId}/`,
      payload
    );
  
    return data;
  },

  // Delete a event article
  async deleteEvent(eventId) {
    // DELETE {API_BASE_URL}/event/event/:id/
    await axiosInstance.delete(`/events/${eventId}/`)
    // original returned null on 204 or parsed JSON; here we just return
    return
  },
}
