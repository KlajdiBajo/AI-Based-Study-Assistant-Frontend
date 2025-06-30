import { create } from "zustand";
import { toast } from "../hooks/use-toast.jsx";

import {
  getNotes,
  searchNotes,
  uploadNote,
  deleteNote,
  getNoteSummary, 
  processNoteWithAI,
} from "../services/noteService";

const useNoteStore = create((set, get) => ({
  notes: [],
  currentSummary: null,
  isLoading: false,
  error: null,
  searchTerm: "",
  pagination: {
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    hasNext: false,
    hasPrevious: false,
  },

  setSearchTerm: (term) => {
    set({ searchTerm: term });
    get().performSearch(term);
  },

  fetchNotes: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await getNotes();
      set({ 
        notes: response.data.notes || [], 
        isLoading: false,
        pagination: {
          currentPage: response.data?.currentPage || 0,
          totalPages: response.data?.totalPages || 0,
          totalElements: response.data?.totalElements || 0,
          hasNext: response.data?.hasNext || false,
          hasPrevious: response.data?.hasPrevious || false,
        }
      });
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to fetch notes.",
        isLoading: false,
      });
    }
  },

  performSearch: async (searchTerm = "", page = 0, size = 100) => {
    try {
      set({ isLoading: true, error: null });

      const params = {
        page,
        size,
      };

      if (searchTerm && searchTerm.trim() !== "") {
        params.q = searchTerm.trim();
      }

      const response = await searchNotes(params);

      set({
        notes: response.data.notes || [], 
        isLoading: false,
        pagination: {
          currentPage: response.data?.currentPage || 0,
          totalPages: response.data?.totalPages || 0,
          totalElements: response.data?.totalElements || 0,
          hasNext: response.data?.hasNext || false,
          hasPrevious: response.data?.hasPrevious || false,
        }
      });
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to search notes.",
        isLoading: false,
      });
    }
  },

  handleUpload: async (file) => {
    try {
      set({ isLoading: true, error: null });
    
      const existingFile = get().notes.find(note => 
        note.fileName === file.name
      );
    
      if (existingFile) {
        set({ isLoading: false });
        toast({
          title: "File Already Exists",
          description: `"${file.name}" has already been uploaded by you.`,
          variant: "destructive",
        });
        return; // Stop upload
      }
    
      const response = await uploadNote(file);
      await get().fetchNotes();
      set({ isLoading: false });
    
      toast({
        title: "Upload Successful",
        description: `"${file.name}" was uploaded successfully!`,
        variant: "success",
      });
    } catch (err) {
      const errorMessage = err.response?.data?.message || "File upload failed.";
      set({
        error: errorMessage,
        isLoading: false,
      });
      
      // Also show toast notification for upload error
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  },

  handleDelete: async (noteId) => {
    try {
      set({ isLoading: true, error: null });
      await deleteNote(noteId);
      await get().fetchNotes();
      set({ isLoading: false });
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to delete note.";
      set({
        error: errorMessage,
        isLoading: false,
      });

      throw err;
    }
  },

  fetchSummary: async (noteId) => {
    try {
      set({ isLoading: true, error: null, currentSummary: null });
      const response = await getNoteSummary(noteId);
      set({ currentSummary: response.data, isLoading: false });
    } catch (err) {
      if (err.response?.status === 404) {
        set({
          currentSummary: null,
          isLoading: false,
          error: null, // Don't show error for missing summary
        });
      } else {
        const errorMessage = err.response?.data?.message || "Failed to fetch summary.";
        set({
          error: errorMessage,
          isLoading: false,
        });
        
        toast({
          title: "Failed to Load Summary",
          description: errorMessage,
          variant: "destructive",
        });
      }
    }
  },

  generateSummary: async (noteId) => {
    try {
      set({ isLoading: true, error: null });

      const { notes } = get();
      const currentNote = notes.find(note => (note.noteId || note.id) === noteId);
      const fileName = currentNote?.fileName || "this document";
      
      // Call the AI processing endpoint
      await processNoteWithAI(noteId);
      
      // After processing, try to fetch the summary
      setTimeout(async () => {
        try {
          const response = await getNoteSummary(noteId);
          set({ currentSummary: response.data, isLoading: false });
          
          toast({
            title: "Summary Generated Successfully!",
            description: `Quiz for "${fileName}" has been created!`,
            variant: "default", // or "success" if you have that variant
          });
        } catch (summaryErr) {
          set({ isLoading: false });
          toast({
            title: "Processing Started",
            description: "Your note is being processed. Please wait a moment and try refreshing.",
            variant: "default",
          });
        }
      }, 2000);
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to start AI processing.";
      set({
        error: errorMessage,
        isLoading: false,
      });
      
      toast({
        title: "AI Processing Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },

  reset: () => {
    set({
      notes: [],
      currentSummary: null,
      isLoading: false,
      error: null,
      searchTerm: "",
      pagination: {
        currentPage: 0,
        totalPages: 0,
        totalElements: 0,
        hasNext: false,
        hasPrevious: false,
      },
    });
  },
}));

export default useNoteStore;