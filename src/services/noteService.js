import { api } from "../lib";

export const getNotes = (searchParams) => {
  return api.get("/notes/search", { 
    params: {
      page: 0,
      size: 100,
      ...searchParams
    }
  });
};

export const getNoteById = (noteId) => {
  return api.get(`/notes/${noteId}`);
};

export const uploadNote = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post("/notes/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const deleteNote = (noteId) => {
  return api.delete(`/notes/${noteId}`);
};

export const processNoteWithAI = (noteId) => {
  return api.post(`/notes/${noteId}/process-ai`, {});
};

export const searchNotes = (params) => {
  return api.get("/notes/search", { params });
};

export const getNoteSummary = (noteId) => {
  return api.get(`/notes/${noteId}/summary`);
};

export const saveNoteSummary = (noteId, summaryData) => {
  return api.post(`/notes/${noteId}/summary`, summaryData);
};