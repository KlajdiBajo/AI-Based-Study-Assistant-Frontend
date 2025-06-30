import { useEffect, useState } from "react";
import { FileText, Filter, Search, Upload as UploadIcon, Trash2, Download, AlertTriangle } from "lucide-react";
import { toast } from "../hooks/use-toast.jsx";

import { useNoteStore } from "../store";

const Upload = () => {
  const [dragActive, setDragActive] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  
  const { 
    notes, 
    fetchNotes,
    handleUpload, 
    handleDelete,
    isLoading, 
    error,
    searchTerm,
    setSearchTerm,
    clearError
  } = useNoteStore();

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    noteId: null,
    fileName: ""
  });

  const onFileDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const onFileChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setLocalSearchTerm(value);
    
    setTimeout(() => {
      setSearchTerm(value);
    }, 300);
  };

  const handleDeleteNote = (noteId, fileName) => {
    setConfirmDialog({
      isOpen: true,
      noteId,
      fileName
    });
  };

  const confirmDelete = async () => {
    try {
      await handleDelete(confirmDialog.noteId);
      toast({
        title: "Success",
        description: "File deleted successfully!",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setConfirmDialog({ isOpen: false, noteId: null, fileName: "" });
    }
  };

  const cancelDelete = () => {
    setConfirmDialog({ isOpen: false, noteId: null, fileName: "" });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "Unknown size";
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileType = (fileName) => {
    if (!fileName) return "Unknown";
    const extension = fileName.split('.').pop()?.toUpperCase();
    return extension || "Unknown";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Upload Notes</h1>
        <div className="flex items-center space-x-2">
          <UploadIcon className="w-5 h-5 text-primary" />
          <span className="text-sm text-muted-foreground">
            PDF, DOCX, TXT, DOC supported
          </span>
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border p-6">
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-accent/50"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={onFileDrop}
        >
          <div className="space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <UploadIcon
                className={`w-8 h-8 text-primary ${
                  isLoading ? "animate-spin" : ""
                }`}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {isLoading ? "Uploading..." : "Drop your files here or browse"}
              </h3>
              <p className="text-muted-foreground mb-4">
                Support for PDF, DOCX, TXT, and DOC files up to 50MB
              </p>
              <input
                type="file"
                accept=".pdf,.docx,.txt,.doc"
                onChange={onFileChange}
                className="hidden"
                id="file-upload"
                disabled={isLoading}
              />
              <label
                htmlFor="file-upload"
                className={`inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors cursor-pointer ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <UploadIcon className="w-5 h-5 mr-2" />
                Choose Files
              </label>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
            <button 
              onClick={clearError}
              className="text-red-500 text-xs mt-1 hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              Uploaded Files ({notes.length})
            </h2>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search files..."
                  value={localSearchTerm}
                  onChange={handleSearchChange}
                  className="pl-10 pr-4 py-2 bg-muted border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground placeholder-muted-foreground w-64"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="divide-y divide-border">
          {isLoading && !notes.length ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading files...</p>
            </div>
          ) : notes.length > 0 ? (
            notes.map((note) => (
              <div
                key={note.noteId || note.id}
                className="p-4 hover:bg-accent transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground truncate">
                        {note.fileName || note.title || "Untitled"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {getFileType(note.fileName)} • 
                        {note.uploadedAt ? (
                          <span> Uploaded on {new Date(note.uploadedAt).toLocaleDateString()}</span>
                        ) : (
                          <span> Recently uploaded</span>
                        )}
                        {note.status && (
                          <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                            note.status === 'uploaded' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {note.status}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => handleDeleteNote(note.noteId || note.id, note.fileName || "this file")}
                      className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete file"
                      disabled={isLoading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? `No files found matching "${searchTerm}"` : "No files uploaded yet"}
              </p>
              {searchTerm && (
                <button
                  onClick={() => {
                    setLocalSearchTerm("");
                    setSearchTerm("");
                  }}
                  className="text-primary text-sm mt-2 hover:underline"
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 animate-in fade-in-0 zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete File</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Are you sure you want to delete <span className="font-medium text-gray-900">"{confirmDialog.fileName}"</span>? This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={cancelDelete}
                  className="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium shadow-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Upload;