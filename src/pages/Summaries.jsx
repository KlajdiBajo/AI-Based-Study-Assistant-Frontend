import React, { useState } from 'react';
import { FileText, Brain, RefreshCw, Download, Search, Sparkles } from 'lucide-react';

export const Summaries = () => {
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const documents = [
    {
      id: '1',
      name: 'Biology Chapter 1.pdf',
      uploadDate: '2024-01-15',
      status: 'completed',
      summary:
        'This chapter introduces the fundamental concepts of biology, including the characteristics of living organisms, cellular structure, and basic metabolic processes.',
      keyPoints: [
        'Living organisms exhibit organization, metabolism, and reproduction',
        'Cells are the basic unit of life',
        'Homeostasis maintains internal balance',
        'Evolution explains biodiversity',
      ],
    },
    {
      id: '2',
      name: 'Physics Mechanics.pdf',
      uploadDate: '2024-01-14',
      status: 'completed',
      summary:
        'Comprehensive overview of classical mechanics covering motion, forces, energy, and momentum in physical systems.',
      keyPoints: [
        "Newton's laws of motion govern object behavior",
        'Energy can be kinetic or potential',
        'Momentum is conserved in isolated systems',
        'Work equals force times displacement',
      ],
    },
    {
      id: '3',
      name: 'Chemistry Basics.pdf',
      uploadDate: '2024-01-13',
      status: 'processing',
    },
    {
      id: '4',
      name: 'Mathematics Calculus.pdf',
      uploadDate: '2024-01-12',
      status: 'pending',
    },
  ];

  const filteredDocuments = documents.filter((doc) =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGenerateSummary = () => {
    if (!selectedDocument) return;
    setIsGenerating(true);
    console.log('Generating summary for:', selectedDocument.name);

    setTimeout(() => {
      setIsGenerating(false);
    }, 3000);
  };

  const handleRegenerateSummary = () => {
    console.log('Regenerating summary for:', selectedDocument?.name);
    handleGenerateSummary();
  };

  const handleDownloadSummary = () => {
    console.log('Downloading summary for:', selectedDocument?.name);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Summary Ready';
      case 'processing':
        return 'AI Processing...';
      case 'pending':
        return 'Ready to Process';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800">AI Summaries</h1>
        <div className="flex items-center space-x-2">
          <Brain className="w-5 h-5 text-blue-500" />
          <span className="text-sm text-slate-600">AI-powered insights</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-4 border-b border-slate-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
              {filteredDocuments.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDocument(doc)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    selectedDocument?.id === doc.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <FileText className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 truncate">{doc.name}</p>
                      <p className="text-xs text-slate-500 mt-1">{doc.uploadDate}</p>
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${getStatusColor(
                          doc.status
                        )}`}
                      >
                        {getStatusText(doc.status)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full">
            {selectedDocument ? (
              <div className="p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-800">{selectedDocument.name}</h2>
                    <p className="text-sm text-slate-500 mt-1">
                      Uploaded on {selectedDocument.uploadDate}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {selectedDocument.status === 'completed' && selectedDocument.summary && (
                      <>
                        <button
                          onClick={handleRegenerateSummary}
                          disabled={isGenerating}
                          className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Regenerate Summary"
                        >
                          <RefreshCw
                            className={`w-5 h-5 ${isGenerating ? 'animate-spin' : ''}`}
                          />
                        </button>
                        <button
                          onClick={handleDownloadSummary}
                          className="p-2 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Download Summary"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {selectedDocument.status === 'completed' && selectedDocument.summary ? (
                  <div className="flex-1 space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-slate-800 mb-3">Summary</h3>
                      <div className="p-4 bg-slate-50 rounded-lg border">
                        <p className="text-slate-700 leading-relaxed">
                          {selectedDocument.summary}
                        </p>
                      </div>
                    </div>

                    {selectedDocument.keyPoints && (
                      <div>
                        <h3 className="text-lg font-medium text-slate-800 mb-3">Key Points</h3>
                        <div className="space-y-3">
                          {selectedDocument.keyPoints.map((point, index) => (
                            <div
                              key={index}
                              className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-100"
                            >
                              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                                {index + 1}
                              </div>
                              <p className="text-slate-700">{point}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center max-w-md">
                      <Sparkles className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-slate-800 mb-2">
                        {selectedDocument.status === 'processing'
                          ? 'AI is Processing...'
                          : 'Generate AI Summary'}
                      </h3>
                      <p className="text-slate-500 mb-6">
                        {selectedDocument.status === 'processing'
                          ? 'Please wait while our AI analyzes your document and creates a comprehensive summary.'
                          : 'Click the button below to generate an AI-powered summary of your document with key insights and important points.'}
                      </p>
                      {selectedDocument.status !== 'processing' && (
                        <button
                          onClick={handleGenerateSummary}
                          disabled={isGenerating}
                          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isGenerating ? (
                            <>
                              <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                              Generating Summary...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-5 h-5 mr-2" />
                              Generate Summary
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center p-6">
                <div className="text-center">
                  <Brain className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-800 mb-2">Select a Document</h3>
                  <p className="text-slate-500">Choose a document to view or generate its AI summary</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
