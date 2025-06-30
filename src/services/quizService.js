import { api } from "../lib";

export const getQuizByNoteId = (noteId) => {
  return api.get(`/notes/${noteId}/quiz`);
};

export const getQuizById = (quizId) => {
  return api.get(`/quiz/${quizId}`);
};

export const saveQuiz = (noteId, quizData) => {
  return api.post(`/notes/${noteId}/quiz`, quizData);
};

export const getQuizQuestions = (quizId) => {
  return api.get(`/quiz/${quizId}/questions`);
};

export const saveQuizQuestions = (quizId, questions) => {
  return api.post(`/quiz/${quizId}/questions`, questions);
};

export const getQuizAttemptsForQuiz = (quizId) => {
  return api.get(`/quiz-attempts/quiz/${quizId}`);
};

export const getQuizAttemptById = (attemptId) => {
  return api.get(`/quiz-attempts/${attemptId}`);
};

export const submitQuizAttempt = (submission) => {
  return api.post("/quiz-attempts/submit", submission);
};

export const deleteQuizAttempt = (attemptId) => {
  return api.delete(`/quiz-attempts/${attemptId}`);
};

export const getUserAttempts = () => {
  return api.get("/quiz-attempts/my-attempts");
};

export const getUserAttemptsWithDocs = async () => {
  const response = await api.get('/quiz-attempts/user/with-documents');
  return response;
};

export const getQuizAnswerReview = (attemptId) => {
  return api.get(`/quiz-answers/attempt/${attemptId}`);
};

export const processNoteWithAI = (noteId) => {
  return api.post(`/notes/${noteId}/process-ai`);
};
