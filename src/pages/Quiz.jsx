import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  FileText,
  Info,
  RotateCcw,
  Trash2,
  Trophy,
  XCircle,
  Plus,
  AlertTriangle,
} from "lucide-react";

import { useNoteStore, useQuizStore } from "../store";
import { toast } from "../hooks/use-toast.jsx";

const Quiz = () => {
  const { id: noteId } = useParams();
  const navigate = useNavigate();

  const {
    quiz,
    questions,
    attempts,
    allAttempts,
    currentAttempt,
    answerReview,
    isLoading,
    error,
    fetchQuizByNoteId,
    fetchQuestions,
    fetchAttempts,
    fetchAllAttempts,
    submitQuiz,
    deleteAttempt,
    fetchAnswerReview,
    generateQuiz,
    resetQuizState,
  } = useQuizStore();

  const { notes, fetchNotes } = useNoteStore();
  
  const note = noteId && noteId !== "undefined" 
    ? notes.find((n) => (n.id || n.noteId)?.toString() === noteId?.toString()) 
    : null;

  const [view, setView] = useState("start");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [attemptToDelete, setAttemptToDelete] = useState(null);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Add this new function to properly check and load quiz data
  const loadQuizData = async (noteId) => {
    try {
      // First check if quiz exists
      const existingQuiz = await fetchQuizByNoteId(noteId);
      
      if (existingQuiz) {
        // Quiz exists, now get questions and attempts
        await Promise.all([
          fetchQuestions(noteId),
          fetchAttempts(noteId)
        ]);
      } else {
        // No quiz exists yet, just load attempts (which will be empty)
        await fetchAttempts(noteId);
      }
    } catch (error) {
      console.error("Error loading quiz data:", error);
    }
  };

  // Update the useEffect that loads quiz data
  useEffect(() => {
    if (noteId && noteId !== "undefined") {
      loadQuizData(noteId);
    } else {
      fetchAllAttempts();
    }
    
    return () => resetQuizState();
  }, [noteId]);

  const handleStartQuiz = async () => {    
    // Check 24-hour rule first
    if (!canStartQuiz()) {
      const hoursLeft = getHoursUntilCanStart();
      toast({
        title: "Quiz Temporarily Blocked",
        description: `You cannot take this quiz yet. Please wait ${hoursLeft} more hours after deletion.`,
        variant: "destructive",
      });
      return;
    }

    // CRITICAL: Reset all local state first
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    
    // CRITICAL: Clear any previous attempt data from store
    // This prevents showing stale results
    const { resetQuizState, takeAgain } = useQuizStore.getState();
    
    // If we're coming from a completed view, use takeAgain to reset store state
    if (view === "completed") {
      const success = await takeAgain(noteId);
      if (!success) {
        return;
      }
    }
    
    // Set view to quiz
    setView("quiz");
    
    // Check if we have questions loaded
    if (questions.length === 0) {
      if (quiz && (quiz.id || quiz.quizId)) {
        const loadedQuestions = await fetchQuestions(noteId);
        if (loadedQuestions.length === 0) {
          await handleGenerateQuiz();
          return;
        }
      } else {
        await handleGenerateQuiz();
        return;
      }
    }
  };

  const handleGenerateQuiz = async () => {
    const result = await generateQuiz(noteId);
    if (result) {
      // After successful generation, refresh questions and attempts
      await loadQuizData(noteId);
    }
  };

  const handleReviewAttempt = async (attemptId) => {  
    try {     
      // Wait for the fetchAnswerReview to complete and return data
      const result = await fetchAnswerReview(attemptId);
     
      // Only set view to review if we got data back
      if (result && result.questions && result.questions.length > 0) {
        setView("review");
      } else {
        toast({
          title: "Review Failed",
          description: "No review data available for this attempt.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Review Failed", 
        description: "Failed to load quiz review.",
        variant: "destructive",
      });
    }
  };

  const handleAnswerSelect = (questionId, selectedOption) => {
    setUserAnswers((prev) => ({ ...prev, [questionId]: selectedOption }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    const formattedAnswers = Object.entries(userAnswers).map(
      ([questionId, selectedOption]) => ({
        questionId: parseInt(questionId, 10),
        selectedOption,
      })
    );
    const result = await submitQuiz(noteId, formattedAnswers);
    if (result) {
      setView("completed");
    }
  };

  const handleDocumentSelect = (documentId) => {
    setSelectedDocumentId(documentId);
  };

  const canStartQuiz = () => {
    if (!quiz || (!quiz.id && !quiz.quizId)) return false;
    
    const quizId = quiz.id || quiz.quizId;
    const { canTakeQuiz } = useQuizStore.getState();
    return canTakeQuiz(quizId);
  };

  const getHoursUntilCanStart = () => {
    if (!quiz || (!quiz.id && !quiz.quizId)) return 0;
    
    const quizId = quiz.id || quiz.quizId;
    const { getHoursUntilCanRetake } = useQuizStore.getState();
    return getHoursUntilCanRetake(quizId);
  };

  const DeleteConfirmationDialog = ({ isOpen, onClose, onConfirm, attemptData }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
          {/* Header */}
          <div className="flex items-center p-6 pb-4">
            <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">Delete File</h3>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 pb-6">
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete "{attemptData?.documentName}"? This action cannot be undone.
            </p>
            
            {/* Warning Box */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-start">
                <Info className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">Important Warning</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    If you delete this attempt, you will not be able to take this quiz again for the next 24 hours.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Function to check if attempt can be deleted (5-minute rule)
  const canDeleteAttempt = (attemptedAt) => {
    const attemptTime = new Date(attemptedAt);
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    return attemptTime <= fiveMinutesAgo;
  };

  // Replace your existing handleDeleteAttempt function with this:
  const handleDeleteAttempt = async (attemptId) => {
    const attempt = allAttempts.find(a => a.id === attemptId);
    if (!attempt) return;

    // Check 5-minute rule - FIX: Use the correct field name
    if (!canDeleteAttempt(attempt.attemptedAt)) { // ← Changed from attempt.attemptDate
      toast({
        title: "Cannot Delete",
        description: "Cannot delete recent quiz attempts. Please wait 5 minutes after submission.",
        variant: "destructive",
      });
      return;
    }

    // Show confirmation dialog
    setAttemptToDelete(attempt);
    setShowDeleteDialog(true);
  };

  // Add this new function to confirm deletion:
  const confirmDeletion = async () => {
    if (!attemptToDelete) return;

    try {
      await deleteAttempt(attemptToDelete.id);
      
      // Close dialog
      setShowDeleteDialog(false);
      setAttemptToDelete(null);
    } catch (error) {
      // Error handling is already in the store
      setShowDeleteDialog(false);
      setAttemptToDelete(null);
    }
  };

  // Dashboard view when no noteId is provided
  if (!noteId || noteId === "undefined") {

    if (view === "review") {
      return (
        <div className="max-w-4xl mx-auto p-8">
          <div className="mb-8">
            <button
              onClick={() => setView("start")}
              className="group flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-200"
            >
              <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-0.5 transition-transform duration-200" />
              <span className="relative">
                Quiz Dashboard
                <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-200"></span>
              </span>
            </button>
          </div>
          
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Quiz Review
          </h1>
          
          {isLoading && !answerReview ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading review...</p>
            </div>
          ) : answerReview?.questions ? (
            <div className="space-y-6">             
              {answerReview.questions.map((q, index) => (
                <div key={q.questionId} className="border border-gray-300 p-4 rounded">
                  <h3 className="font-bold mb-2">Question {index + 1}:</h3>
                  <p className="mb-2">{q.questionText}</p>
                  
                  <div className="bg-blue-50 p-3 rounded mb-2">
                    <p><strong>Your Answer:</strong> {q.userAnswer}</p>
                  </div>
                  
                  <div className="bg-green-50 p-3 rounded mb-2">
                    <p><strong>Correct Answer:</strong> {q.correctAnswer}</p>
                  </div>
                  
                  <div className={`p-2 rounded ${q.isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
                    <p><strong>Result:</strong> {q.isCorrect ? '✅ Correct' : '❌ Incorrect'}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-red-100 border border-red-400 p-4 rounded">
              <p className="text-red-600">❌ No review data available</p>
            </div>
          )}
        </div>
      );
    }

    // Regular dashboard view
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">AI Quiz Generator</h1>
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">
              AI-powered Quiz Generation
            </span>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-12 gap-6">
            {/* Left Panel - Select Document for Quiz */}
            <div className="col-span-7">
              <div className="bg-card rounded-xl shadow-sm border border-border">
                <div className="p-4 border-b border-border">
                  <h2 className="text-lg font-semibold text-foreground">Select Document for Quiz</h2>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notes.length === 0 ? (
                    <div className="p-8 text-center">
                      <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No documents uploaded yet.</p>
                      <button
                        onClick={() => navigate('/upload')}
                        className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center mx-auto space-x-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Upload Documents</span>
                      </button>
                    </div>
                  ) : (
                    notes.map((note, index) => {
                      const noteId = note.id || note.noteId;
                      const isSelected = selectedDocumentId !== null && selectedDocumentId === noteId;
                      
                      return (
                        <button
                          key={noteId || index}
                          onClick={() => handleDocumentSelect(noteId)}
                          className={`w-full text-left p-4 hover:bg-accent transition-colors flex items-center justify-between ${
                            isSelected ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                          } ${index !== notes.length - 1 ? "border-b border-border" : ""}`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0 p-2 bg-primary/10 rounded-lg">
                              <FileText className="w-4 h-4 text-primary" />
                            </div>
                            <div className="flex-grow min-w-0">
                              <h3 className="font-medium text-foreground truncate text-sm">
                                {note.fileName || note.name || "Untitled Document"}
                              </h3>
                            </div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
                {selectedDocumentId && (
                  <div className="p-4 border-t border-border">
                    <button
                      onClick={() => navigate(`/quiz/${selectedDocumentId}`)}
                      className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                      <Trophy className="w-5 h-5" />
                      <span>Generate Quiz</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel - Recent Attempts */}
            <div className="col-span-5">
              <div className="bg-card rounded-xl shadow-sm border border-border">
                <div className="p-4 border-b border-border">
                  <h2 className="text-lg font-semibold text-foreground">Recent Attempts</h2>
                </div>
                <div className="p-4">
                  {allAttempts.length === 0 ? (
                    <div className="text-center py-8">
                      <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No quiz attempts yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {allAttempts.slice(0, 2).map((attempt, index) => (
                        <div key={`recent-${attempt.id || index}`} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div>
                            <h3 className="font-medium text-foreground text-sm">
                              {attempt.documentName || "Quiz"}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              {attempt.score}/{attempt.totalQuestions}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-bold ${
                              attempt.score / attempt.totalQuestions >= 0.8 
                                ? "text-green-600" 
                                : attempt.score / attempt.totalQuestions >= 0.6 
                                ? "text-yellow-600" 
                                : "text-red-600"
                            }`}>
                              {Math.round((attempt.score / attempt.totalQuestions) * 100)}%
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {attempt.formattedDate}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* All Quiz Attempts Table - Full Width */}
          <div className="bg-card rounded-xl shadow-sm border border-border">
            <div className="p-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">All Quiz Attempts</h2>
            </div>
            {allAttempts.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No quiz attempts yet.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Select a document above to generate and take your first quiz!
                </p>
              </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 px-4 font-medium text-muted-foreground">Document</th>
                        <th className="text-left py-2 px-4 font-medium text-muted-foreground">Score</th>
                        <th className="text-left py-2 px-4 font-medium text-muted-foreground">Percentage</th>
                        <th className="text-left py-2 px-4 font-medium text-muted-foreground">Date</th>
                        <th className="text-right py-2 px-4 font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allAttempts.map((attempt, index) => {
                        // Check if this document still exists in uploaded notes
                        const documentExists = notes.some(note => 
                          (note.fileName || note.name) === attempt.documentName
                        );
                        
                        return (
                          <tr key={`attempt-${attempt.quizAttemptId || index}`} className="border-b border-border hover:bg-accent/50">
                            <td className="py-3 px-4">
                              <span className={`${
                                documentExists 
                                  ? "text-foreground" 
                                  : "text-muted-foreground/50"
                              }`}>
                                {attempt.documentName || "Quiz"}
                              </span>
                            </td>
                            <td className={`py-3 px-4 ${
                              documentExists ? "text-foreground" : "text-muted-foreground/50"
                            }`}>
                              {attempt.score}/{attempt.totalQuestions}
                            </td>
                            <td className={`py-3 px-4 font-medium ${
                              !documentExists 
                                ? "text-muted-foreground/50"
                                : attempt.score / attempt.totalQuestions >= 0.8 
                                ? "text-green-600" 
                                : attempt.score / attempt.totalQuestions >= 0.6 
                                ? "text-yellow-600" 
                                : "text-red-600"
                            }`}>
                              {Math.round((attempt.score / attempt.totalQuestions) * 100)}%
                            </td>
                            <td className={`py-3 px-4 ${
                              documentExists ? "text-foreground" : "text-muted-foreground/50"
                            }`}>
                              {new Date(attempt.attemptedAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4 text-right space-x-2">
                              <button
                                onClick={() => handleReviewAttempt(attempt.id)} // Changed from attempt.quizAttemptId
                                className="p-1 text-blue-500 hover:text-blue-700 rounded transition-colors"
                                title="Review Attempt"
                              >
                                <FileText className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteAttempt(attempt.id)} // Changed from attempt.quizAttemptId  
                                className="p-1 text-red-500 hover:text-red-700 rounded transition-colors"
                                title="Delete Attempt"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
          </div>
        </div>
        {/* DELETE CONFIRMATION DIALOG - ADD IT HERE */}
        <DeleteConfirmationDialog
          isOpen={showDeleteDialog}
          onClose={() => {
            setShowDeleteDialog(false);
            setAttemptToDelete(null);
          }}
          onConfirm={confirmDeletion}
          attemptData={attemptToDelete}
        />
      </div>
    );
  }

  // Loading state
  if (isLoading && !note && view !== "review" && !answerReview) {
    return (
      <div className="text-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Loading quiz details...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center p-8">
        <div className="text-red-500 mb-4">
          <XCircle className="w-12 h-12 mx-auto mb-2" />
          <p>Error: {error}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Review view
  if (view === "review") {    
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="mb-8">
          <button
            onClick={() => setView("start")}
            className="group flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-200"
          >
            <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-0.5 transition-transform duration-200" />
            <span className="relative">
              Back to Quiz Details
              <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-200"></span>
            </span>
          </button>
        </div>
        
        <h1 className="text-3xl font-bold text-foreground mb-2">
          🎯 QUIZ REVIEW TEST
        </h1>
        
        <div className="bg-yellow-100 border border-yellow-400 p-4 rounded mb-6">
          <p><strong>Debug Info:</strong></p>
          <p>View: {view}</p>
          <p>Is Loading: {isLoading ? "Yes" : "No"}</p>
          <p>Has answerReview: {answerReview ? "Yes" : "No"}</p>
          <p>Questions Count: {answerReview?.questions?.length || 0}</p>
        </div>
        
        {answerReview?.questions ? (
          <div className="space-y-6">
            <p className="text-green-600 font-bold">✅ REVIEW DATA LOADED SUCCESSFULLY!</p>
            
            {answerReview.questions.map((q, index) => (
              <div key={q.questionId} className="border border-gray-300 p-4 rounded">
                <h3 className="font-bold mb-2">Question {index + 1}:</h3>
                <p className="mb-2">{q.questionText}</p>
                
                <div className="bg-blue-50 p-3 rounded mb-2">
                  <p><strong>Your Answer:</strong> {q.userAnswer}</p>
                </div>
                
                <div className="bg-green-50 p-3 rounded mb-2">
                  <p><strong>Correct Answer:</strong> {q.correctAnswer}</p>
                </div>
                
                <div className={`p-2 rounded ${q.isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
                  <p><strong>Result:</strong> {q.isCorrect ? '✅ Correct' : '❌ Incorrect'}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-red-100 border border-red-400 p-4 rounded">
            <p className="text-red-600">❌ No review data available</p>
          </div>
        )}
      </div>
    );
  }

  // Completed view
  if (view === "completed" && currentAttempt) {  
    // CRITICAL FIX: Use corrected values from store, with robust fallbacks
    const displayScore = currentAttempt.score || 0;
    const displayTotal = currentAttempt.totalQuestions || questions.length || 0;
    const displayPercentage = currentAttempt.percentage !== undefined 
      ? currentAttempt.percentage 
      : (displayTotal > 0 ? Math.round((displayScore / displayTotal) * 100) : 0);

    return (
      <div className="max-w-4xl mx-auto p-8 bg-card rounded-xl shadow-lg border border-border">
        <h1 className="text-3xl font-bold text-center text-foreground mb-2">
          Quiz Completed!
        </h1>
        <p className="text-center text-muted-foreground mb-6">
          Here's how you did on the "{note?.fileName || note?.name}" quiz.
        </p>
        
        <div className="text-center bg-muted p-6 rounded-lg mb-6">
          <Trophy className={`w-16 h-16 mx-auto mb-4 ${
            displayPercentage >= 80 ? "text-yellow-400" : 
            displayPercentage >= 60 ? "text-orange-400" : "text-gray-400"
          }`} />
          <p className="text-xl text-muted-foreground">Your Score</p>
          <p className="text-6xl font-bold text-primary">
            {displayScore}
            <span className="text-3xl text-muted-foreground">
              /{displayTotal}
            </span>
          </p>
          <p className={`text-xl font-semibold mt-2 ${
            displayPercentage >= 80 ? "text-green-600" : 
            displayPercentage >= 60 ? "text-yellow-600" : "text-red-600"
          }`}>
            {displayPercentage}%
          </p>
        </div>
        <div className="space-y-2">
          <button
            onClick={handleStartQuiz}
            className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center space-x-2"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Take Again</span>
          </button>
          <div className="mb-8">
            <button
              onClick={() => setView("start")}
              className="group flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-200"
            >
              <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-0.5 transition-transform duration-200" />
              <span className="relative">
                Back to Quiz Details
                <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-200"></span>
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz taking view
  if (view === "quiz") {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) {
      return (
        <div className="text-center p-8">
          <p>No questions available for this quiz.</p>
          <div className="mb-8">
            <button
              onClick={() => setView("start")}
              className="group flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-200"
            >
              <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-0.5 transition-transform duration-200" />
              <span className="relative">
                Back to Quiz Details
                <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-200"></span>
              </span>
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="mb-6">
          <div className="mb-6">
            <button
              onClick={() => {
                setView("start");
                setCurrentQuestionIndex(0);
                setUserAnswers({});
              }}
              className="group flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-200"
            >
              <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-0.5 transition-transform duration-200" />
              <span className="relative">
                Back to Quiz Details
                <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-200"></span>
              </span>
            </button>
          </div>
          <h1 className="text-3xl font-bold text-center text-foreground mb-2">
            Quiz: {note?.fileName || note?.name}
          </h1>
          <div className="flex justify-center items-center space-x-4">
            <p className="text-center text-muted-foreground">
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
            <div className="w-32 bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-xl shadow-lg border border-border">
          <p className="text-xl font-semibold text-foreground mb-6 text-center">
            {currentQuestion.questionText}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'A', text: currentQuestion.optionA },
              { label: 'B', text: currentQuestion.optionB },
              { label: 'C', text: currentQuestion.optionC },
              { label: 'D', text: currentQuestion.optionD }
            ].filter(option => option.text && option.text.trim() !== '').map((option, index) => (
              <button
                key={option.label}
                onClick={() => handleAnswerSelect(currentQuestion.id || currentQuestion.quizQuestionId, option.text)}
                className={`p-4 rounded-lg border-2 text-left transition-colors ${
                  userAnswers[currentQuestion.id || currentQuestion.quizQuestionId] === option.text
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50 hover:bg-accent/50"
                }`}
              >
                <div className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-sm font-medium">
                    {option.label}
                  </span>
                  <span>{option.text}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center mt-8">
          <button
            onClick={handlePrevQuestion}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-2 bg-muted text-foreground rounded-lg hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5 inline-block mr-1" /> Previous
          </button>
          
          <span className="text-sm text-muted-foreground">
            {Object.keys(userAnswers).length} of {questions.length} answered
          </span>

          {currentQuestionIndex === questions.length - 1 ? (
            <button
              onClick={handleSubmitQuiz}
              disabled={isLoading || Object.keys(userAnswers).length === 0}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trophy className="w-5 h-5 inline-block mr-2" />{" "}
              {isLoading ? "Submitting..." : "Finish & See Score"}
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              Next <ChevronRight className="w-5 h-5 inline-block ml-1" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Default view - Quiz details for a specific note
  return (
    <div className="max-w-6xl mx-auto space-y-8 p-8">
      <div>
        <div className="mb-8">
          <button
            onClick={() => navigate("/quiz")}
            className="group flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-200"
          >
            <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-0.5 transition-transform duration-200" />
            <span className="relative">
              Quiz Dashboard
              <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-200"></span>
            </span>
          </button>
        </div>
        <h1 className="text-4xl font-bold text-foreground">
          {note?.fileName || note?.name || "Quiz"}
        </h1>
        <p className="text-muted-foreground mt-2">
          Ready to test your knowledge? Take the quiz or review your past attempts.
        </p>
      </div>

      <div className="text-center">
        {isLoading ? (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">
              {quiz ? "Processing quiz..." : "Checking for existing quiz..."}
            </p>
          </div>
        ) : questions.length === 0 ? (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              {quiz 
                ? "Quiz exists but no questions are available. Generate questions to start."
                : "No quiz has been generated for this document yet."
              }
            </p>
            <button
              onClick={handleGenerateQuiz}
              disabled={isLoading}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Generating..." : "Generate Quiz with AI"}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Quiz ready with {questions.length} questions!
            </p>
            {canStartQuiz() ? (
              <button
                onClick={handleStartQuiz}
                disabled={isLoading}
                className="px-8 py-4 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-all duration-200 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Loading..." : "Start Quiz"}
              </button>
            ) : (
              <div className="space-y-2">
                <button
                  disabled={true}
                  className="px-8 py-4 bg-gray-400 text-gray-200 font-bold rounded-lg cursor-not-allowed text-lg opacity-50"
                >
                  Quiz Blocked
                </button>
                <p className="text-red-600 text-sm">
                  Quiz temporarily unavailable. Wait {getHoursUntilCanStart()} more hours after deletion.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-foreground">
            Past Attempts
          </h2>
        </div>
        {attempts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-6 font-medium text-muted-foreground w-2/5">
                    Date
                  </th>
                  <th className="text-center py-3 px-6 font-medium text-muted-foreground w-1/5">
                    Score
                  </th>
                  <th className="text-center py-3 px-6 font-medium text-muted-foreground w-2/5">
                    Percentage
                  </th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((attempt) => {
                  const percentage = Math.round((attempt.score / attempt.totalQuestions) * 100);
                  return (
                    <tr key={attempt.id} className="border-b border-border last:border-b-0 hover:bg-accent/50">
                      <td className="py-4 px-6 text-foreground">
                        {new Date(attempt.attemptedAt || attempt.attemptDate).toLocaleString()}
                      </td>
                      <td className="py-4 px-6 text-foreground font-semibold text-center">
                        {attempt.score}/{attempt.totalQuestions}
                      </td>
                      <td className={`py-4 px-6 font-semibold text-center ${
                        percentage >= 80 ? "text-green-600" : 
                        percentage >= 60 ? "text-yellow-600" : "text-red-600"
                      }`}>
                        {percentage}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center p-8 text-muted-foreground">
            <Trophy className="w-12 h-12 mx-auto mb-4" />
            <p>No attempts made yet.</p>
            <p className="text-sm mt-2">
              {questions.length === 0 
                ? "Generate a quiz first to start taking attempts."
                : "Take the quiz above to see your attempts here."
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quiz;