import api from "@/lib/api";
import type { Note, NoteCreate, NoteUpdate, ImageUploadResponse } from "@/types/notes";

export const notesService = {
  // Get all notes
  getAllNotes: async (): Promise<Note[]> => {
    const response = await api.get<Note[]>("/notes");
    return response.data;
  },

  // Get note by ID
  getNoteById: async (id: string): Promise<Note> => {
    const response = await api.get<Note>(`/notes/${id}`);
    return response.data;
  },

  // Create a new note
  createNote: async (noteData: NoteCreate): Promise<Note> => {
    const response = await api.post<Note>("/notes", noteData);
    return response.data;
  },

  // Update a note
  updateNote: async (id: string, noteData: NoteUpdate): Promise<Note> => {
    const response = await api.put<Note>(`/notes/${id}`, noteData);
    return response.data;
  },

  // Delete a note
  deleteNote: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/notes/${id}`);
    return response.data;
  },

  // Upload image to note
  uploadImage: async (noteId: string, file: File): Promise<ImageUploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    
    const response = await api.post<ImageUploadResponse>(
      `/notes/${noteId}/images`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  // Delete image from note
  deleteImage: async (noteId: string, imageKey: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(
      `/notes/${noteId}/images/${encodeURIComponent(imageKey)}`
    );
    return response.data;
  },

  // Health check
  healthCheck: async (): Promise<{ status: string; service: string }> => {
    const response = await api.get<{ status: string; service: string }>("/health");
    return response.data;
  },
};

export default notesService;

