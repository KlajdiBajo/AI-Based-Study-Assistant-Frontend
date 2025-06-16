import React, { useState } from 'react';
import { FileText, Brain, Clock, Trophy, Trash2, RotateCcw } from 'lucide-react';

export const Quiz = () => {
  const [selectedDocument, setSelectedDocument] = useState('');
  const [currentStep, setCurrentStep] = useState('select');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState([
    {
      id: '1',
      documentName: 'Biology Chapter 1',
      score: 8,
      totalQuestions: 10,
      percentage: 80,
      date: '2024-01-15',
      timeSpent: '5 min 30s'
    },
    {
      id: '2',
      documentName: 'Math Algebra',
      score: 9,
      totalQuestions: 12,
      percentage: 75,
      date: '2024-01-14',
      timeSpent: '8 min 15s'
    }
  ]);

  const documents = [
    { id: '1', name: 'Biology Chapter 1', status: 'Ready' },
    { id: '2', name: 'Math Algebra', status: 'Ready' },
    { id: '3', name: 'Physics Notes', status: 'Processing' },
  ];

  const questions = [
    {
      question: "What is the powerhouse of the cell?",
      options: ["Nucleus", "Mitochondria", "Ribosome", "Endoplasmic Reticulum"],
      correct: 1
    },
    {
      question: "Which process converts glucose into energy?",
      options: ["Photosynthesis", "Cellular Respiration", "Fermentation", "Glycolysis"],
      correct: 1
    }
  ];

  const handleAnswerSelect = (questionIndex, answerIndex) => {
    setAnswers({ ...answers, [questionIndex]: answerIndex });
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      let correctAnswers = 0;
      questions.forEach((q, index) => {
        if (parseInt(answers[index]) === q.correct) {
          correctAnswers++;
        }
      });
      setScore(correctAnswers);
      const newAttempt = {
        id: Date.now().toString(),
        documentName: selectedDocument,
        score: correctAnswers,
        totalQuestions: questions.length,
        percentage: Math.round((correctAnswers / questions.length) * 100),
        date: new Date().toISOString().split('T')[0],
        timeSpent: '3 min 45s'
      };
      setAttempts([newAttempt, ...attempts]);
      setCurrentStep('completed');
    }
  };

  const handleGenerateNewQuiz = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setCurrentStep('quiz');
  };

  const handleBackToSelection = () => {
    setSelectedDocument('');
    setCurrentStep('select');
    setCurrentQuestion(0);
    setAnswers({});
  };

  const handleDeleteAttempt = (attemptId) => {
    setAttempts(attempts.filter(attempt => attempt.id !== attemptId));
  };

  if (currentStep === 'select') {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-slate-800">AI Quiz Generator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">Select Document for Quiz</h2>
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => doc.status === 'Ready' && setSelectedDocument(doc.name)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedDocument === doc.name
                        ? 'border-blue-500 bg-blue-50'
                        : doc.status === 'Ready'
                        ? 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        : 'border-slate-200 bg-slate-100 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-slate-600" />
                        <span className="font-medium text-slate-800">{doc.name}</span>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        doc.status === 'Ready' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {doc.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              {selectedDocument && (
                <button
                  onClick={() => setCurrentStep('quiz')}
                  className="w-full mt-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <Brain className="w-5 h-5" />
                  <span>Generate Quiz</span>
                </button>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">Recent Attempts</h2>
              <div className="space-y-3">
                {attempts.slice(0, 3).map((attempt) => (
                  <div key={attempt.id} className="p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-slate-800 text-sm">{attempt.documentName}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        attempt.percentage >= 80 ? 'bg-green-100 text-green-800' :
                        attempt.percentage >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {attempt.percentage}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{attempt.score}/{attempt.totalQuestions}</span>
                      <span>{attempt.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">All Quiz Attempts</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-medium text-slate-700">Document</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700">Score</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700">Percentage</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700">Time</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((attempt) => (
                  <tr key={attempt.id} className="border-b border-slate-100">
                    <td className="py-3 px-4 text-slate-800">{attempt.documentName}</td>
                    <td className="py-3 px-4 text-slate-800">{attempt.score}/{attempt.totalQuestions}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        attempt.percentage >= 80 ? 'bg-green-100 text-green-800' :
                        attempt.percentage >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {attempt.percentage}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{attempt.date}</td>
                    <td className="py-3 px-4 text-slate-600">{attempt.timeSpent}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleDeleteAttempt(attempt.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'quiz') {
    const currentQ = questions[currentQuestion];
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-800">Quiz: {selectedDocument}</h1>
          <div className="flex items-center space-x-2 text-slate-600">
            <Clock className="w-5 h-5" />
            <span>Question {currentQuestion + 1} of {questions.length}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800 mb-6">{currentQ.question}</h2>
          <div className="space-y-3">
            {currentQ.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(currentQuestion, index.toString())}
                className={`w-full p-4 text-left border rounded-lg transition-all ${
                  answers[currentQuestion] === index.toString()
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span className="font-medium text-slate-700">{String.fromCharCode(65 + index)}.</span>
                <span className="ml-2 text-slate-800">{option}</span>
              </button>
            ))}
          </div>

          <div className="flex justify-between mt-8">
            <button
              onClick={handleBackToSelection}
              className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Back to Selection
            </button>
            <button
              onClick={handleNextQuestion}
              disabled={!answers[currentQuestion]}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentQuestion === questions.length - 1 ? 'Complete Quiz' : 'Next Question'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'completed') {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <Trophy className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Quiz Completed!</h1>
          <p className="text-slate-600">Here are your results for {selectedDocument}</p>
        </div>

        <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 text-center">
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div>
              <div className="text-3xl font-bold text-blue-600">{score}</div>
              <div className="text-sm text-slate-600">Correct Answers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">{questions.length}</div>
              <div className="text-sm text-slate-600">Total Questions</div>
            </div>
            <div>
              <div className={`text-3xl font-bold ${
                percentage >= 80 ? 'text-green-600' : 
                percentage >= 60 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {percentage}%
              </div>
              <div className="text-sm text-slate-600">Score</div>
            </div>
          </div>

          <div className="flex space-x-4 justify-center">
            <button
              onClick={handleGenerateNewQuiz}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Generate New Quiz</span>
            </button>
            <button
              onClick={handleBackToSelection}
              className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Back to Selection
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
