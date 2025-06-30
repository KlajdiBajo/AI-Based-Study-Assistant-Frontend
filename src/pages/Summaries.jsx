import { useEffect, useState } from "react";
import { BrainCircuit, ChevronRight, FileText, Search, RefreshCw, Download } from "lucide-react";

import { useNoteStore } from "../store";

const Summaries = () => {
  const {
    notes,
    currentSummary,
    isLoading,
    error,
    fetchNotes,
    fetchSummary,
    generateSummary,
  } = useNoteStore();
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  useEffect(() => {
    if (notes.length > 0 && !selectedNoteId) {
      const firstNote = notes[0];
      const firstNoteId = firstNote?.noteId || firstNote?.id;
      
      if (firstNoteId && firstNoteId !== undefined) {
        setSelectedNoteId(firstNoteId);
        fetchSummary(firstNoteId);
      }
    }
  }, [notes, fetchSummary, selectedNoteId]);

  const handleNoteSelect = (noteId) => {
    setSelectedNoteId(noteId);
    fetchSummary(noteId);
  };

  const handleGenerateClick = () => {
    if (selectedNoteId) {
      generateSummary(selectedNoteId);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const getFileName = (note) => {
    return note.fileName || note.name || note.title || "Untitled Document";
  };

  // Filter notes based on search term
  const filteredNotes = notes.filter((note) =>
    getFileName(note).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedNote = notes.find((note) => 
    (note.noteId || note.id) === selectedNoteId
  );

  const parseKeyPoints = (content) => {
    if (!content) return [];
    
    const lines = content.split('\n').filter(line => line.trim());
    const keyPoints = [];
    
    lines.forEach(line => {
      if (line.trim().startsWith('- ')) {
        const cleaned = line.replace(/^-\s*/, '').replace(/^SUMMARY:\s*-?\s*/i, '').trim();
        if (cleaned) {
          keyPoints.push(cleaned);
        }
      }
    });
    
    if (keyPoints.length === 0) {
      lines.forEach(line => {
        if (line.match(/^\d+\./) || line.match(/^[•·]\s/) || line.includes('Key Point') || line.includes('Important:')) {
          const cleaned = line.replace(/^\d+\.\s*/, '').replace(/^[•·]\s*/, '').replace(/^SUMMARY:\s*-?\s*/i, '').trim();
          if (cleaned) {
            keyPoints.push(cleaned);
          }
        }
      });
    }
    
    if (keyPoints.length === 0 && content.length > 0) {
      const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 30);
      return sentences.map(s => s.trim());
    }
    
    return keyPoints;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">AI Summaries</h1>
        <div className="flex items-center space-x-2">
          <BrainCircuit className="w-5 h-5 text-primary" />
          <span className="text-sm text-muted-foreground">
            AI-powered Summary Generation
          </span>
        </div>
      </div>

      <div className="flex space-x-6">
        {/* Sidebar - PDF Files List */}
        <aside className="w-1/3">
          <div className="bg-card rounded-xl shadow-sm border border-border">
            {/* Search */}
            <div className="p-4 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-muted border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground placeholder-muted-foreground"
                />
              </div>
            </div>

            {/* PDF Files List */}
            <div className="divide-y divide-border">
              {isLoading && !notes.length ? (
                <div className="p-8 text-center">
                  <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p className="text-muted-foreground">Loading documents...</p>
                </div>
              ) : filteredNotes.length === 0 ? (
                <div className="p-8 text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {searchTerm ? "No documents match your search." : "No documents uploaded yet."}
                  </p>
                </div>
              ) : (
                filteredNotes.map((note) => {
                  const noteId = note.noteId || note.id;
                  const isSelected = selectedNoteId === noteId;
                  
                  return (
                    <button
                      key={noteId}
                      onClick={() => handleNoteSelect(noteId)}
                      className={`w-full text-left p-4 hover:bg-accent transition-colors relative ${
                        isSelected ? "bg-primary/5" : ""
                      }`}
                    >
                      {/* Blue border indicator */}
                      {isSelected && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-sm"></div>
                      )}
                      
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 p-2 bg-primary/10 rounded-lg">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-grow min-w-0">
                          <h3 className="font-medium text-foreground truncate mb-1">
                            {getFileName(note)}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(note.uploadedAt || note.uploadDate || note.createdAt)}
                          </p>
                        </div>
                        {isSelected && (
                          <ChevronRight className="w-5 h-5 text-primary flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="bg-card rounded-xl shadow-sm border border-border">
            {selectedNote ? (
              <>
                {/* Header */}
                <div className="border-b border-border p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h1 className="text-2xl font-bold text-foreground">
                      {getFileName(selectedNote)}
                    </h1>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => fetchSummary(selectedNoteId)}
                        disabled={isLoading}
                        className="p-2 text-muted-foreground hover:text-primary disabled:opacity-50"
                        title="Refresh"
                      >
                        <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                      </button>
                      <button
                        onClick={handleGenerateClick}
                        disabled={isLoading}
                        className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <BrainCircuit className="w-5 h-5 mr-2" />
                        {isLoading ? "Generating..." : currentSummary ? "Regenerate Summary" : "Generate Summary"}
                      </button>
                    </div>
                  </div>
                  <p className="text-muted-foreground">
                    Uploaded on {formatDate(selectedNote.uploadedAt || selectedNote.uploadDate || selectedNote.createdAt)}
                  </p>
                </div>

                {/* Content Area */}
                <div className="p-6">
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                      <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mb-4"></div>
                      <p>Generating summary...</p>
                    </div>
                  ) : error ? (
                    <div className="flex flex-col items-center justify-center h-64">
                      <div className="text-red-500 text-6xl mb-4">⚠️</div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">Error</h3>
                      <p className="text-muted-foreground mb-4">{error}</p>
                      <button
                        onClick={handleGenerateClick}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        Try Again
                      </button>
                    </div>
                  ) : currentSummary ? (
                    <div className="max-w-4xl">
                      {/* Key Points Section Only */}
                      {parseKeyPoints(currentSummary.content).length > 0 ? (
                        <div>
                          <h2 className="text-xl font-semibold text-foreground mb-4">Key Points</h2>
                          <div className="space-y-3">
                            {parseKeyPoints(currentSummary.content).map((point, index) => (
                              <div key={index} className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                                  {index + 1}
                                </div>
                                <p className="text-foreground leading-relaxed">{point}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                          <BrainCircuit className="w-16 h-16 mb-4 text-muted-foreground" />
                          <h3 className="text-lg font-semibold text-foreground mb-2">No key points found</h3>
                          <p className="text-muted-foreground mb-4">The summary doesn't contain structured key points.</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                      <BrainCircuit className="w-16 h-16 mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">This note hasn't been processed yet.</h3>
                      <p className="text-muted-foreground mb-4">Click 'Generate Summary' to get started.</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-96 text-muted-foreground">
                <FileText className="w-16 h-16 mb-4 text-muted-foreground" />
                <h2 className="text-xl font-semibold text-foreground mb-2">Select a Document</h2>
                <p className="text-muted-foreground">Choose a document to view or generate its AI summary</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Summaries;