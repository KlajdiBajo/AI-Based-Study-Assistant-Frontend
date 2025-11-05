import { create } from "zustand";
import { toast } from "../hooks/use-toast.jsx";

import {
  getQuizByNoteId,
  saveQuiz,
  getQuizQuestions,
  submitQuizAttempt,
  getQuizAttemptsForQuiz,
  deleteQuizAttempt,
  getQuizAttemptById,
  getQuizAnswerReview,
  getUserAttempts,
} from "../services/quizService";

const useQuizStore = create((set, get) => ({
  quiz: null,
  questions: [],
  attempts: [],
  allAttempts: [],
  currentQuizId: null,
  currentAttempt: null,
  answerReview: null,
  isLoading: false,
  error: null,
  deletedQuizzes: [],

  // Get quiz by note ID - this will fetch or create quiz for a note
  fetchQuizByNoteId: async (noteId) => {
    try {
      // Validate noteId
      if (!noteId || noteId === "undefined" || noteId === "null") {
        set({ quiz: null, questions: [], isLoading: false });
        return null;
      }

      set({ isLoading: true, error: null });
      const response = await getQuizByNoteId(noteId);
      
      if (!response || !response.data) {
        set({ quiz: null, questions: [], isLoading: false });
        return null;
      }

      set({ 
        quiz: response.data, 
        currentQuizId: response.data.id || response.data.quizId,
        isLoading: false 
      });
      return response.data;
    } catch (err) {
      console.error("Error fetching quiz by note ID:", err);
      // If no quiz exists, that's ok - we'll show generate button
      if (err.response?.status === 404) {
        set({ quiz: null, questions: [], isLoading: false });
        return null;
      } else {
        set({
          error: err.response?.data?.message || "Failed to fetch quiz.",
          isLoading: false,
        });
        return null;
      }
    }
  },

  // Fetch questions for a quiz (using the quiz ID from note's quiz)
  fetchQuestions: async (noteId) => {
    try {
      // Validate noteId
      if (!noteId || noteId === "undefined" || noteId === "null") {
        set({ questions: [], isLoading: false });
        return [];
      }

      set({ isLoading: true, error: null });
      
      // First get the quiz for this note
      const quiz = await get().fetchQuizByNoteId(noteId);
      if (!quiz || (!quiz.id && !quiz.quizId)) {
        set({ questions: [], isLoading: false });
        return [];
      }

      // Then get questions for this quiz
      const quizId = quiz.id || quiz.quizId;
      if (!quizId) {
        set({ questions: [], isLoading: false });
        return [];
      }

      const response = await getQuizQuestions(quizId);
      
      if (!response || !response.data) {
        set({ questions: [], isLoading: false });
        return [];
      }

      set({ questions: response.data, isLoading: false });
      return response.data;
    } catch (err) {
      console.error("Error fetching questions:", err);
      set({
        error: err.response?.data?.message || "Failed to fetch questions.",
        isLoading: false,
        questions: []
      });
      return [];
    }
  },

  // Submit quiz attempt (noteId is used to get the quiz ID)
  submitQuiz: async (noteId, userAnswers) => {
    try {
      // Validate inputs
      if (!noteId || noteId === "undefined" || noteId === "null") {
        throw new Error("Invalid note ID");
      }
      
      if (!userAnswers || !Array.isArray(userAnswers) || userAnswers.length === 0) {
        throw new Error("No answers provided");
      }

      set({ isLoading: true, error: null });
      
      // Get the quiz for this note first
      const { quiz, questions, canTakeQuiz, getHoursUntilCanRetake } = get();
      if (!quiz || (!quiz.id && !quiz.quizId)) {
        throw new Error("No quiz found for this note");
      }

      const quizId = quiz.id || quiz.quizId;

      // Check 24-hour rule before submitting
      if (!canTakeQuiz(quizId)) {
        const hoursLeft = getHoursUntilCanRetake(quizId);
        throw new Error(`You cannot take this quiz yet. Please wait ${hoursLeft} more hours after deletion.`);
      }

      if (!questions || questions.length === 0) {
        throw new Error("No questions found for this quiz");
      }
      
      // Format answers to match backend UserAnswerDto expectations
      const formattedAnswers = userAnswers.map(answer => {
        if (!answer || !answer.questionId || !answer.selectedOption) {
          throw new Error("Invalid answer format");
        }

        const questionId = parseInt(answer.questionId, 10);
        if (isNaN(questionId)) {
          throw new Error("Invalid question ID");
        }

        const selectedText = answer.selectedOption;
        
        // Find the question to determine which option letter was selected
        const question = questions.find(q => 
          (q.id || q.quizQuestionId) === questionId
        );
        
        let selectedOptionChar = 'A'; // default fallback
        
        if (question) {
          // Map the selected text back to the option letter
          if (selectedText === question.optionA) {
            selectedOptionChar = 'A';
          } else if (selectedText === question.optionB) {
            selectedOptionChar = 'B';
          } else if (selectedText === question.optionC) {
            selectedOptionChar = 'C';
          } else if (selectedText === question.optionD) {
            selectedOptionChar = 'D';
          }
        }
        
        return {
          questionId: questionId,
          selectedOption: selectedOptionChar // Send as single character
        };
      });

      const submission = { 
        quizId: parseInt(quizId, 10),
        userAnswers: formattedAnswers
      };
      
      if (isNaN(submission.quizId)) {
        throw new Error("Invalid quiz ID");
      }
            
      const response = await submitQuizAttempt(submission);
      
      if (!response || !response.data) {
        throw new Error("Invalid response from server");
      }

      let totalQuestions = questions.length;
      if (totalQuestions === 0) {
        totalQuestions = response.data.totalQuestions || userAnswers.length || 1;
      }
      
      const score = response.data.score || 0;
      const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
      
      const correctedResponse = {
        ...response.data,
        totalQuestions: totalQuestions,  // Use our calculated value
        percentage: percentage,          // Use our calculated value
        // Ensure we have a unique attempt ID for tracking
        attemptId: response.data.quizAttemptId || response.data.id || Date.now(),
        // Add timestamp to ensure uniqueness
        submittedAt: new Date().toISOString()
      };

      // CRITICAL FIX: Refresh attempts using quiz ID directly (not note ID)
      try {
        const attemptsResponse = await getQuizAttemptsForQuiz(quizId);
        if (attemptsResponse && attemptsResponse.data) {
          set({ attempts: attemptsResponse.data });
        }
      } catch (fetchErr) {
        console.warn("⚠️ Failed to refresh attempts (non-critical):", fetchErr);
      }
      
      // Set the current attempt with fresh data
      set({ 
        isLoading: false, 
        currentAttempt: correctedResponse,
        error: null // Clear any previous errors
      });

      toast({
        title: "Quiz Submitted!",
        description: `You scored ${score}/${totalQuestions} (${percentage}%)`,
        variant: "default",
      });

      return correctedResponse;
    } catch (err) {
      
      const errorMessage = err.response?.data?.message || err.message || "Failed to submit quiz.";
      set({
        error: errorMessage,
        isLoading: false,
      });

      toast({
        title: "Submission Failed",
        description: typeof errorMessage === 'string' ? errorMessage : 'Failed to submit quiz',
        variant: "destructive",
      });
      return null;
    }
  },

  canTakeQuiz: (quizId) => {
    const { deletedQuizzes } = get();
    
    // Convert quizId to consistent format for comparison
    const normalizedQuizId = String(quizId);
    
    const deletionRecord = deletedQuizzes.find(record => 
      String(record.quizId) === normalizedQuizId
    );
    
    if (!deletionRecord) return true;

    const deletionTime = new Date(deletionRecord.deletedAt);
    const now = new Date();
    const twentyFourHoursLater = new Date(deletionTime.getTime() + 24 * 60 * 60 * 1000);
    
    console.log('🔍 Quiz availability check:', {
      quizId: normalizedQuizId,
      deletionTime: deletionTime.toISOString(),
      now: now.toISOString(),
      canRetakeAt: twentyFourHoursLater.toISOString(),
      canTake: now >= twentyFourHoursLater
    });
    
    return now >= twentyFourHoursLater;
  },

  // Take quiz again - resets state and prepares for new attempt
  takeAgain: async (noteId) => {
    try {
      if (!noteId || noteId === "undefined" || noteId === "null") {
        throw new Error("Invalid note ID");
      }

      console.log("🔄 Taking quiz again for note:", noteId);
      set({ isLoading: true, error: null });
      
      // CRITICAL: Clear previous attempt data to prevent showing stale results
      set({ 
        currentAttempt: null, 
        answerReview: null,
        error: null 
      });
      
      // Fetch fresh questions from database (don't regenerate with AI)
      const questions = await get().fetchQuestions(noteId);
      
      if (!questions || questions.length === 0) {
        throw new Error("No questions available for retake");
      }
      
      set({ isLoading: false });
      
      console.log("✅ Quiz reset successfully, ready for new attempt");
      
      toast({
        title: "Ready to Retake!",
        description: "Quiz has been reset. Good luck!",
        variant: "default",
      });
      
      return true;
    } catch (err) {
      console.error("❌ Take again error:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to reset quiz.";
      set({
        error: errorMessage,
        isLoading: false,
      });

      toast({
        title: "Reset Failed",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  },

  getHoursUntilCanRetake: (quizId) => {
    const { deletedQuizzes } = get();
    const deletionRecord = deletedQuizzes.find(record => record.quizId === quizId);
    if (!deletionRecord) return 0;

    const deletionTime = new Date(deletionRecord.deletedAt);
    const canRetakeAt = new Date(deletionTime.getTime() + 24 * 60 * 60 * 1000);
    const now = new Date();
    
    if (now >= canRetakeAt) return 0;

    const remainingMs = canRetakeAt.getTime() - now.getTime();
    const remainingHours = Math.ceil(remainingMs / (1000 * 60 * 60));
    
    return remainingHours;
  },

  // Fetch attempts using existing quiz data when possible
  fetchAttempts: async (noteId) => {
    try {
      // Validate noteId
      if (!noteId || noteId === "undefined" || noteId === "null") {
        set({ attempts: [], isLoading: false });
        return;
      }

      set({ isLoading: true, error: null });
      
      // First try to use existing quiz from state (avoids 404 errors)
      const { quiz } = get();
      let currentQuiz = quiz;
      
      // Only fetch quiz if we don't have it in state
      if (!currentQuiz || (!currentQuiz.id && !currentQuiz.quizId)) {
        try {
          currentQuiz = await get().fetchQuizByNoteId(noteId);
        } catch (quizErr) {
          console.warn("Could not fetch quiz for attempts:", quizErr);
          set({ attempts: [], isLoading: false });
          return;
        }
      }
      
      if (!currentQuiz || (!currentQuiz.id && !currentQuiz.quizId)) {
        set({ attempts: [], isLoading: false });
        return;
      }

      const quizId = currentQuiz.id || currentQuiz.quizId;
      console.log("📋 Fetching attempts for quiz ID:", quizId);
      
      const response = await getQuizAttemptsForQuiz(quizId);
      
      if (!response || !response.data) {
        set({ attempts: [], isLoading: false });
        return;
      }

      console.log("✅ Found", response.data.length, "attempts");
      set({ attempts: response.data, isLoading: false });
    } catch (err) {
      console.error("❌ Error fetching attempts:", err);
      set({
        error: err.response?.data?.message || "Failed to fetch attempts.",
        isLoading: false,
        attempts: []
      });
    }
  },

  fetchAllAttempts: async () => {
    const { isLoading } = get();
    if (isLoading) {
      return;
    }

    try {
      set({ isLoading: true, error: null });
      
      // Import the new service function
      const { getUserAttemptsWithDocs } = await import("../services/quizService");
      const attemptsResponse = await getUserAttemptsWithDocs();
      
      if (!attemptsResponse || !attemptsResponse.data) {
        set({ allAttempts: [], isLoading: false });
        return;
      }

      const attempts = attemptsResponse.data;
          
      // Process attempts using the data that's already returned from API
      const processedAttempts = attempts.map((attempt) => {
        return {
          id: attempt.quizAttemptId,
          quizId: attempt.quizId,
          score: attempt.score || 0,
          totalQuestions: attempt.totalQuestions || 0, // Use API data directly
          percentage: attempt.totalQuestions > 0 ? 
            Math.round((attempt.score / attempt.totalQuestions) * 100) : 0,
          attemptedAt: attempt.attemptedAt, // Use the correct field name
          documentName: attempt.documentName || `Quiz ${attempt.quizId}`,
          formattedDate: attempt.attemptedAt ? 
            new Date(attempt.attemptedAt).toLocaleDateString() : 
            "Invalid Date"
        };
      });
          
      set({ allAttempts: processedAttempts, isLoading: false });
    } catch (err) {
      console.error("Error fetching all attempts:", err);
      set({
        error: err.response?.data?.message || "Failed to fetch attempts.",
        isLoading: false,
        allAttempts: []
      });
    }
  },

  fetchAttemptDetails: async (attemptId) => {
    try {
      if (!attemptId || attemptId === "undefined" || attemptId === "null") {
        throw new Error("Invalid attempt ID");
      }

      set({ isLoading: true, error: null, currentAttempt: null });
      const response = await getQuizAttemptById(attemptId);
      
      if (!response || !response.data) {
        throw new Error("No attempt data received");
      }

      set({ currentAttempt: response.data, isLoading: false });
    } catch (err) {
      console.error("Error fetching attempt details:", err);
      set({
        error: err.response?.data?.message || err.message || "Failed to fetch attempt details.",
        isLoading: false,
      });
    }
  },

  deleteAttempt: async (attemptId) => {
    try {
      if (!attemptId || attemptId === "undefined" || attemptId === "null") {
        throw new Error("Invalid attempt ID");
      }

      set({ isLoading: true, error: null });
      
      // Find the attempt to get quiz info before deletion
      const { allAttempts } = get();
      const attemptToDelete = allAttempts.find(attempt => attempt.id === attemptId);
      
      if (!attemptToDelete) {
        throw new Error("Attempt not found");
      }

      console.log('🗑️ Deleting attempt:', attemptToDelete);
      
      // Call backend to delete
      await deleteQuizAttempt(attemptId);
      
      // IMMEDIATELY remove from BOTH local state arrays
      set(state => ({
        allAttempts: state.allAttempts.filter(attempt => attempt.id !== attemptId),
        attempts: state.attempts.filter(attempt => attempt.id !== attemptId)
      }));
      
      // CRITICAL: Add to deleted quizzes list with proper quizId tracking
      if (attemptToDelete.quizId) {
        console.log('📝 Recording deletion for quizId:', attemptToDelete.quizId);
        
        set(state => ({
          deletedQuizzes: [
            // Remove any existing record for this quiz
            ...state.deletedQuizzes.filter(record => 
              String(record.quizId) !== String(attemptToDelete.quizId)
            ),
            // Add new deletion record
            {
              quizId: attemptToDelete.quizId,
              documentName: attemptToDelete.documentName,
              deletedAt: new Date().toISOString()
            }
          ]
        }));
        
        console.log('✅ Updated deletedQuizzes:', get().deletedQuizzes);
      }
      
      toast({
        title: "Attempt Deleted",
        description: "Quiz attempt has been deleted successfully. You cannot retake this quiz for 24 hours.",
        variant: "default",
      });

    } catch (err) {
      console.error("Error deleting attempt:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to delete attempt.";
      set({
        error: errorMessage,
        isLoading: false,
      });

      toast({
        title: "Delete Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchAnswerReview: async (attemptId) => {
    console.log("🔍 fetchAnswerReview called with attemptId:", attemptId);
    
    try {
      if (!attemptId || attemptId === "undefined" || attemptId === "null") {
        throw new Error("Invalid attempt ID");
      }

      console.log("📋 Setting loading state...");
      set({ isLoading: true, error: null, answerReview: null });
      
      console.log("📋 Making API call to getQuizAnswerReview...");
      const response = await getQuizAnswerReview(attemptId);
      console.log("📋 API response:", response);
      
      if (!response || !response.data) {
        throw new Error("No review data received");
      }

      console.log("🔍 Raw answer review data:", response.data);

      // Simple processing for now
      const reviewData = {
        attemptDate: response.data[0]?.attemptedAt || new Date().toISOString(),
        questions: response.data.map(answer => ({
          questionId: answer.questionId,
          questionText: answer.questionText || 'Question text not available',
          userAnswer: answer.selectedAnswer || 'No answer',
          correctAnswer: answer.correctAnswer || 'No correct answer',
          isCorrect: Boolean(answer.correct),
          explanation: answer.explanation || null
        }))
      };

      console.log("📊 Processed review data:", reviewData);
      set({ answerReview: reviewData, isLoading: false });
      return reviewData;
    } catch (err) {
      console.error("❌ Error fetching answer review:", err);
      console.error("❌ Error details:", err.response?.data);
      set({
        error: err.response?.data?.message || err.message || "Failed to fetch answer review.",
        isLoading: false,
      });
      throw err;
    }
  },

  // SIMPLIFIED generateQuiz function - just shows a message for now
  generateQuiz: async (noteId) => {
    try {
      if (!noteId || noteId === "undefined" || noteId === "null") {
        throw new Error("Invalid note ID");
      }

      set({ isLoading: true, error: null });
      
      // First check if quiz already exists and has questions
      const existingQuiz = await get().fetchQuizByNoteId(noteId);
      
      if (existingQuiz && (existingQuiz.id || existingQuiz.quizId)) {
        // Quiz exists, now check if it has questions
        try {
          const quizId = existingQuiz.id || existingQuiz.quizId;
          const questionsResponse = await getQuizQuestions(quizId);
          if (questionsResponse?.data && questionsResponse.data.length > 0) {
            set({ 
              quiz: existingQuiz,
              questions: questionsResponse.data,
              isLoading: false 
            });
            
            toast({
              title: "Quiz Already Exists",
              description: "Loading existing quiz for this document.",
              variant: "default",
            });
            return existingQuiz;
          }
        } catch (questionsErr) {
          console.log("No questions found for existing quiz:", questionsErr);
        }
      }

      // For now, just show a message that the user needs to generate from summaries page
      set({ isLoading: false });
      
      toast({
        title: "Generate Quiz from Summaries",
        description: "Please go to the Summaries page and generate the quiz for this document first.",
        variant: "destructive",
      });
      
      return null;

    } catch (err) {
      console.error("Error generating quiz:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to check quiz.";
      set({
        error: errorMessage,
        isLoading: false,
      });

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    }
  },

  resetQuizState: () => {
    set({
      quiz: null,
      questions: [],
      currentQuizId: null,
      currentAttempt: null,
      attempts: [],
      answerReview: null,
      error: null
    });
  },

  clearError: () => {
    set({ error: null });
  },
}));

export default useQuizStore;