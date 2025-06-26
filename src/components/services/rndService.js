// src/services/eventService.js
import axiosInstance from "../../api";

export const rndService = {
  async getAllRnd() {
    const { data } = await axiosInstance.get("/rnd/");
    if (data.results?.result) return data.results.result;
    if (Array.isArray(data)) return data;
    return data.results || [];
  },

  async getrndDetail(rndId) {
    const { data } = await axiosInstance.get(`/rnd/${rndId}/`);
    return data;
  },

  async createRnd(formData) {
    const payload = new FormData();

    payload.append("title", formData.title);
    payload.append("title_am", formData.title_am);
    payload.append("description", formData.description);
    payload.append("description_am", formData.description_am);
    payload.append("link", formData.link);
    payload.append("author", formData.author);
    payload.append("tags", formData.tags);
    payload.append("type", formData.type);
    payload.append("category", formData.category);

    if (formData.coverimage instanceof File) {
      payload.append("coverimage", formData.coverimage);
    }

    if (formData.logo instanceof File) {
      payload.append("logo", formData.logo);
    }

    if (Array.isArray(formData.images)) {
      formData.images.forEach((file) => {
        if (file instanceof File) {
          payload.append("images", file); // Django parses multiple files like this
        }
      });
    } else if (formData.images instanceof File) {
      payload.append("images", formData.images);
    }

    const { data } = await axiosInstance.post("/rnd/", payload);
    return data;
  },

  async updateRnd(rndId, formData) {
    const payload = new FormData();

    payload.append("title", formData.title);
    payload.append("title_am", formData.title_am);
    payload.append("description", formData.description);
    payload.append("description_am", formData.description_am);
    payload.append("link", formData.link);
    payload.append("author", formData.author);
    payload.append("tags", formData.tags);
    payload.append("type", formData.type);
    payload.append("category", formData.category);

    if (formData.coverimage instanceof File) {
      payload.append("coverimage", formData.coverimage);
    }

    if (formData.logo instanceof File) {
      payload.append("logo", formData.logo);
    }

    if (Array.isArray(formData.images)) {
      formData.images.forEach((file) => {
        if (file instanceof File) {
          payload.append("images", file);
        }
      });
    } else if (formData.images instanceof File) {
      payload.append("images", formData.images);
    }

    const { data } = await axiosInstance.put(`/rnd/${rndId}/`, payload);
    return data;
  },

  async deleteRnd(rndId) {
    await axiosInstance.delete(`/rnd/${rndId}/`);
    return;
  }
};
